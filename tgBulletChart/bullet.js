(function() {

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
d3.bullet = function() {
  var orient = "left", // TODO top & bottom
      reverse = false,
      duration = 0,
      ranges = bulletRanges,
      markers = bulletMarkers,
      measures = bulletMeasures,
      primaryValue = bulletPrimaryValue,
      secondaryValue = bulletSecondaryValue,
      width = 380,
      height = 30,
      tickFormat = null;

  function getMaxValue(d) {
    var max = 0;
    if(d.primaryValue && max < d.primaryValue) {
      max = d.primaryValue;
    }
    if(d.secondaryValue && max < d.secondaryValue) {
      max = d.secondaryValue;
    }
    var index = 0;
    var current = 0;
    if(d.markers) {
      for(index = 0; index < d.markers.length; index++) {
        current = d.markers[index];
        if(current > max) {
          max = current;
        }
      }
    }
    if(d.measures) {
      for(index = 0; index < d.measures.length; index++) {
        current = d.measures[index];
        if(current > max) {
          max = current;
        }
      }
    }
    if(d.ranges) {
      for(index = 0; index < d.ranges.length; index++) {
        current = d.ranges[index];
        if(current > max) {
          max = current;
        }
      }
    }
    return max;
  }

  // For each small multiple…
  function bullet(g) {
    g.each(function(d, i) {

      var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
          markerz = markers.call(this, d, i).slice().sort(d3.descending),
          measurez = measures.call(this, d, i).slice().sort(d3.descending),
          g = d3.select(this);

      var max = getMaxValue(d) + 20; // add some margin

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain([0, max])
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
      var background = g.selectAll("rect.background")
        .data([max]);
      background.enter().append("rect")
          .attr("class", "background")
          .attr("width", w0)
          .attr("height", height)
          .attr("x", reverse ? x0 : 0)
        .transition()
          .duration(duration)
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
        var rangeTop = d.rangeHigh || max;
        var acceptableRange = g.selectAll("rect.range")
            .data([{bottom: rangeBottom, top: rangeTop}]);

        var scaleForRange = w1;
        var previousScaleForRange = w0;


        acceptableRange.enter().append("rect")
            .attr("class", "range")
            .attr("width", function(d,i) {return previousScaleForRange(d.top - d.bottom);})
            .attr("height", height)
            .attr("x", function(d,i) {return previousScaleForRange(d.bottom);})
          .transition()
            .duration(duration)
            .attr("width", function(d,i) {return scaleForRange(d.top - d.bottom);})
            .attr("x", function(d,i) {return scaleForRange(d.bottom);});

        acceptableRange.transition()
            .duration(duration)
            .attr("x", function(d,i) {return scaleForRange(d.bottom);})
            .attr("width", function(d,i) {return scaleForRange(d.top - d.bottom);})
            .attr("height", height);

      }

/*
      // Update the range rects.
      var range = g.selectAll("rect.range")
          .data(rangez);

      range.enter().append("rect")
          .attr("class", function(d, i) { return "range s" + i; })
          .attr("width", w0)
          .attr("height", height)
          .attr("x", reverse ? x0 : 0)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      range.transition()
          .duration(duration)
          .attr("x", reverse ? x1 : 0)
          .attr("width", w1)
          .attr("height", height);
*/
      // Update the measure rects.
      /*
      var measure = g.selectAll("rect.measure")
          .data(measurez);

      measure.enter().append("rect")
          .attr("class", function(d, i) { return "measure s" + i; })
          .attr("width", w0)
          .attr("height", height / 3)
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 3)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      measure.transition()
          .duration(duration)
          .attr("width", w1)
          .attr("height", height / 3)
          .attr("x", reverse ? x1 : 0)
          .attr("y", height / 3);
*/
      if(d.secondaryValue) {
        var secondaryBullet = g.selectAll("rect.measure.secondary")
            .data([d.secondaryValue]);

      secondaryBullet.enter().append("rect")
          .attr("class", "measure secondary")
          .attr("width", w0)
          .attr("height", height - (height / 2.5))
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 5)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      secondaryBullet.transition()
          .duration(duration)
          .attr("width", w1)
          .attr("height", height - (height / 2.5))
          .attr("x", reverse ? x1 : 0)
          .attr("y", height / 5);

      }

      if(d.primaryValue) {
        var primaryBullet = g.selectAll("rect.measure.primary")
            .data([d.primaryValue]);

function setBulletColor(value, rangeBottom, rangeTop) {
  var color = "#295FDE";
  var needsAttention = false;
  if(rangeBottom && rangeBottom > value) {
    needsAttention = true;
  }
  if(rangeTop && rangeTop < value) {
    needsAttention = true;
  }
  if(needsAttention) {
    color = "#dd0110";
  }
  else {
    color = "#295FDE";
  }
  return color;
}

function transitionBulletColor(d3element, value, rangeBottom, rangeTop) {
  var needsAttention = false;
  if(rangeBottom && rangeBottom > value) {
    needsAttention = true;
  }
  if(rangeTop && rangeTop < value) {
    needsAttention = true;
  }
  if(needsAttention) {
    window.console.log("NEEDS ATTENTION");
    d3element.transition().delay(1000).duration(1000).style("fill", "#dd0110");
    //d3element.transition().delay(1000).duration(1000).style("class", "measure primary attention");
  }
  else {
    d3element.transition().delay(1000).duration(1000).style("fill", "#295FDE");
  }
}

      primaryBullet.enter().append("rect")
          .attr("class", "measure primary")
          .style("fill", function(d, i) {return setBulletColor(d, rangeBottom, rangeTop);})
          .attr("width", w0)
          .attr("height", height / 3)
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 3)
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


transitionBulletColor(primaryBullet, d.primaryValue, d.rangeLow, d.rangeHigh);

      }


/*
      primaryBullet.enter().append("rect")
          .attr("class", function(d, i) {return setPrimaryBulletClass(d, rangeBottom, rangeTop);})
          .attr("width", w0)
          .attr("height", height / 3)
          .attr("x", reverse ? x0 : 0)
          .attr("y", height / 3)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverse ? x1 : 0);

      primaryBullet.transition()
          .duration(duration)
          .attr("class", function(d, i) {return setPrimaryBulletClass(d, rangeBottom, rangeTop);})
          .attr("width", w1)
          .attr("height", height / 3)
          .attr("x", reverse ? x1 : 0)
          .attr("y", height / 3);

      }
*/
      // Update the marker lines.
      var marker = g.selectAll("line.marker")
          .data(markerz);

      marker.enter().append("line")
          .attr("class", function(d, i) { return "marker s" + i; })
          .attr("x1", x0)
          .attr("x2", x0)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6)
        .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1);

      marker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6);

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(5);

      // Update the tick groups.
      var tick = g.selectAll("g.tick")
          .data(x1.ticks(8), function(d) {
            return this.textContent || format(d);
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tick")
          .attr("transform", bulletTranslate(x0))
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
          .attr("transform", bulletTranslate(x1))
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

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    reverse = orient == "right" || orient == "bottom";
    return bullet;
  };

  // ranges (bad, satisfactory, good)
  bullet.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return bullet;
  };

  // markers (previous, goal)
  bullet.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return bullet;
  };

  // measures (actual, forecast)
  bullet.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
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

  bullet.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bullet;
  };

  return bullet;
};

function bulletRanges(d) {
  return d.ranges;
}

function bulletMarkers(d) {
  return d.markers;
}

function bulletMeasures(d) {
  return d.measures;
}

function bulletPrimaryValue(d) {
  return d.primaryValue;
}
function bulletSecondaryValue(d) {
  return d.secondaryValue;
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
