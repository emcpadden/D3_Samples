// tgBullet
// This is a D3 Plugin for drawing a Bullet Chart using D#
// The code for this plugin was modified from the source
// of the D# bullet chart example that can be found at:
// http://bl.ocks.org/mbostock/4061961
// 
// NOTE: This example was based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/


(function() {

d3.tgBulletChart = function() {
  var reverse = false,
      duration = 800,
      markers = bulletMarkers,
      width = 300,
      height = 30,
      inRangeColor = "#295FDE",
      outOfRangeColor = "#DD0110",
      tickFormat = null;

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {
      var data = d;
      var markerz = markers.call(this, d, i).slice();
      var g = d3.select(this);
      var chartmax = getChartMax(d); // add some margin

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain([0, chartmax])
          .range(reverse ? [width, 0] : [0, width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Derive width-scales from the x-scales.
      var w0 = bulletWidth(x0),
          w1 = bulletWidth(x1);

      // draw a background for the bullet chart
      var background = g.selectAll("rect.tg-bulletchart__background")
        .data([chartmax]);
      background.enter().append("rect")
          .attr("class", "tg-bulletchart__background")
          .attr("width", w0)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      background.transition()
          .duration(duration)
          .attr("x", reverse ? x1 : 0)
          .attr("width", w1)
          .attr("height", height);

      var rangeBottom = null;
      var rangeTop = null;

      // draw the range
      if(d.rangeLow || d.rangeHigh) {
        var rangeBottom = d.rangeLow || 0;
        var rangeTop = d.rangeHigh || chartmax;

        var acceptableRange = g.selectAll("rect.tg-bulletchart__range")
            .data([{bottom: rangeBottom, top: rangeTop}]);

        var scaleForRange = w1;
        var previousScaleForRange = w0;

        acceptableRange.enter().append("rect")
            .attr("class", "tg-bulletchart__range")
            .attr("height", height)
            .attr("width", function(d,i) {return scaleForRange(d.top - d.bottom);})
            .attr("x", function(d,i) {return reverse ? scaleForRange(chartmax - d.top) : scaleForRange(d.bottom);})
            .append("svg:title").text(function(d) {return getToolTip("range", data, d)});

        acceptableRange.transition()
            .duration(duration)
            .attr("x", function(d,i) {return reverse ? scaleForRange(chartmax - d.top) : scaleForRange(d.bottom);})
            .attr("width", function(d,i) {return scaleForRange(d.top - d.bottom);})
            .attr("height", height);

        acceptableRange.select("title").text(function(d) {return getToolTip("range", data, d)});
      }

      if(d.secondaryValue) {
        var secondaryBullet = g.selectAll("rect.tg-bulletchart__bullet--secondary")
            .data([d.secondaryValue]);

        secondaryBullet.enter().append("rect")
            .attr("class", "tg-bulletchart__bullet tg-bulletchart__bullet--secondary")
            .attr("height", height - (height / 2.5))
            .attr("width", w1)
            .attr("x", reverse ? x1 : 0)
            .attr("y", height / 5)
            .append("svg:title").text(function(d) {return getToolTip("secondary", data, d)});

        secondaryBullet.transition()
            .duration(duration)
            .attr("width", function(d,i) {return scaleForRange(d);})
            .attr("height", height - (height / 2.5))
            .attr("x", function(d,i) {return reverse ? scaleForRange(d) : 0;})
            .attr("y", height / 5);

        secondaryBullet.select("title").text(function(d) {return getToolTip("secondary", data, d)});
      }

      if(d.primaryValue) {
        var primaryBullet = g.selectAll("rect.tg-bulletchart__bullet--primary")
            .data([d.primaryValue]);

        primaryBullet.enter().append("rect")
            .attr("class", "tg-bulletchart__bullet tg-bulletchart__bullet--primary")
            .style("fill", function(d, i) {return setBulletColor(d, rangeBottom, rangeTop, inRangeColor, outOfRangeColor);})
            .attr("width", w0)
            .attr("height", height / 3)
            .attr("x", reverse ? x0 : 0)
            .attr("y", height / 3)
            .append("svg:title").text(function(d) {return getToolTip("primary", data, d)})
          .transition()
            .duration(duration)
            .attr("width", w1)
            .attr("x", reverse ? x1 : 0);

        primaryBullet.transition()
            .duration(duration)
            .attr("width", w1)
            .attr("height", height / 3)
            .attr("x", reverse ? x1 : 0)
            .attr("y", height / 3);

        primaryBullet.select("title").text(function(d) {return getToolTip("primary", data, d)});

        transitionBulletColor(primaryBullet, d.primaryValue, d.rangeLow, d.rangeHigh, inRangeColor, outOfRangeColor, duration);
      }

      // Update the marker lines.
      var marker = g.selectAll("line.tg-bulletchart__marker")
          .data(markerz);

      marker.enter().append("line")
          .attr("class", function(d, i) { return "tg-bulletchart__marker tg-bulletchart__marker--" + i; })
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6)
          .append("svg:title").text(function(d, i) {return getToolTip("marker", data, d, i)});

      marker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6);

      marker.select("title").text(function(d) {return getToolTip("marker", data, d, i)});

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(5);

      // Update the tick groups.
      var tick = g.selectAll("g.tick")
          .data(x1.ticks(5), function(d) {
            return this.textContent || format(d);
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tick")
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1e-6);

      tickEnter.append("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickEnter.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("y", height * 7 / 6)
          .text(format);

      // Transition the entering ticks to the new scale, x1.
      tickEnter.transition()
          .duration(duration)
          .style("opacity", 1);

      // Transition the updating ticks to the new scale, x1.
      var tickUpdate = tick.transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1);

      tickUpdate.select("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickUpdate.select("text")
          .attr("y", height * 7 / 6);

      // Transition the exiting ticks to the new scale, x1.
      tick.exit().transition()
          .duration(duration)
          .attr("transform", bulletTranslate(x1))
          .style("opacity", 1e-6)
          .remove();
    });
    d3.timer.flush();
  }

  // markers (previous, goal)
  bullet.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  bullet.inRangeColor = function(x) {
    if (!arguments.length) return inRangeColor;
    inRangeColor = x;
    return bullet;
  };

  bullet.outOfRangeColor = function(x) {
    if (!arguments.length) return outOfRangeColor;
    outOfRangeColor = x;
    return bullet;
  };

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function getToolTip(type, data, d, i) {
  var tooltip = "";
  switch(type)  {
    case "primary":
      tooltip = data.primaryValueTooltip || d;
      break;
    case "secondary":
      tooltip = data.secondaryValueTooltip || d;
      break;
    case "range":
      if(data.rangeTooltip) {
        tooltip = data.rangeTooltip;
      }
      else if(data.rangeLow && data.rangeHigh) {
        tooltip = "between " + data.rangeLow + " and " + data.rangeHigh;
      }
      else if(data.rangeHigh) {
        tooltip = "above " + data.rangeHigh;
      }
      else if(data.rangeLow) {
        tooltip = "atleast " + data.rangeHigh;
      }
      break;
    case "marker":
      if(data.markerTooltips){
        if(i < data.markerTooltips.length) {
          tooltip = data.markerTooltips[i];
        }
      }
      if(tooltip === "") {
        tooltip = data.markers[i];
      }
      break;
  }
  return tooltip;
}

function getChartMax(d) {
  var max = 0;
  if(typeof d.chartMax !== 'undefined') {
    max = d.chartMax;
  }
  else {
    var index = 0;
    var current = 0;
    if(d.primaryValue && max < d.primaryValue) {
      max = d.primaryValue;
    }
    if(d.secondaryValue && max < d.secondaryValue) {
      max = d.secondaryValue;
    }
    if(d.markers) {
      for(index = 0; index < d.markers.length; index++) {
        current = d.markers[index];
        if(current > max) {
          max = current;
        }
      }
    }
    if(d.rangeLow) {
      if(d.rangeLow > max) {
        max = d.rangeLow;
      }
    }
    if(d.rangeHigh) {
      if(d.rangeHigh > max) {
        max = d.rangeHigh;
      }
    }
  }
  if(d.chartMaxBuffer) {
    switch(d.chartMaxBufferType) {
      case "percent":
        max = max + (max * d.chartMaxBuffer/100);
        break;
      default:
        max = max + d.chartMaxBuffer;
        break;
    }
  }
  return max;
}

function setBulletColor(value, rangeBottom, rangeTop, inRangeColor, outOfRangeColor) {
  var color = "#295FDE";
  var needsAttention = false;
  if(rangeBottom && rangeBottom > value) {
    needsAttention = true;
  }
  if(rangeTop && rangeTop < value) {
    needsAttention = true;
  }
  if(needsAttention) {
    color = outOfRangeColor;
  }
  else {
    color = inRangeColor;
  }
  return color;
}

function transitionBulletColor(d3element, value, rangeBottom, rangeTop, inRangeColor, outOfRangeColor, duration) {
  var needsAttention = false;
  if(rangeBottom && rangeBottom > value) {
    needsAttention = true;
  }
  if(rangeTop && rangeTop < value) {
    needsAttention = true;
  }
  if(needsAttention) {
    d3element.transition().delay(duration).duration(duration).style("fill", outOfRangeColor);
  }
  else {
    d3element.transition().delay(duration).duration(duration).style("fill", inRangeColor);
  }
}

function bulletMarkers(d) {
  return d.markers;
}

function bulletTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function bulletWidth(x) {
  var x0 = x(0);
  return function(d) {
    return Math.abs(x(d) - x0);
  };
}

})();
