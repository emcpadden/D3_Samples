// tgVarianceChart
// This is a D3 Plugin for drawing a Variance Chart using D#

//==============================================================================
// This requires D3.  Go to http://d3js.org/ to download a copy of D3.js or use
// bower to retrieve a copy:
//  bower install d3
//==============================================================================

//==============================================================================
// IMPORTANT:  This control is currently being used as part of the Matrix Demo
// project and is subject to change.  Use at your own risk.
//==============================================================================

//==============================================================================
// The data format for this plugin is as follows:
// (note: any additional propertyies will be ignored):
// {
//    "value": 3,  // This is the value of the variance bar
//    "tooltip": [OPTIONAL] "3% Expense increase over last month",  // this is the tooltip displayed on hover of the variance bar.  If this is missing, we display the unformatted value on hover
//    "rangeLow": -4, // [OPTIONAL] this is the low end of the acceptable range, if this is missing it is set to zero
//    "rangeHigh": 4, // [OPTIONAL] the high end of the acceptable range, if this is missing it is set to the highest value so that there effectively is no limit on the upper end
//    "rangeTooltip": "[OPTIONAL] Acceptable Range is between $60K and $75K",
//    "markers":[2, -5], //[OPTIONAL] this is an array of values to display as markers,classes are added to them to distinguish the order of these
//    "markerTooltips":["2% is the max increase month to month over the last year", "-1% increase this month last year"], // [OPTIONAL] this is an array of tooltips for the markers, if any are missing, then the unformatted value is displayed
//    "chartRangeMin": -10 // [OPTIONAL] this is the max value that should be limit the upper end of the chart.  Parts of any values that exceed this are not displayed.  
//    "chartRangeMax": 10 // [OPTIONAL] this is the min value that should be limit the lower end of the chart.  Parts of any values that exceed this are not displayed.  
// }
//
//

/* global d3:true */
(function() {

d3.tgVarianceChart = function() {
  var duration = 800,             // this is the duration of the animations
      width = 300,                // the width of the chart
      markers = varianceMarkers,  // any markers that should be displayed
      height = 30,                // the height of the chart
      tickFormat = null;          // a function that can be used to format the tick values

  var inRangeColor = "#295FDE";       // This is the color of a bar that is within range
  var inRangeColorAlt = "#6487D9";    // This is an alternate color (usually a lighter shade of the one above),
                                      //    This is used when we are animating a out of range value to the other side
                                      //    of the zero mark.  After the animation, the bar is colored according to whether
                                      //    the new value is in range or out of range.  This color is only shown during a
                                      //    navigation that crosses the zero line.
  var outOfRangeColor = "#DD0110";    // This is the color of a bar that is out of range
  var outOfRangeColorAlt = "#DE5B64"; // This is an alternate color (usually a lighter shade of the one above),
                                      //    This is used when we are animating a out of range value to the other side
                                      //    of the zero mark.  After the animation, the bar is colored according to whether
                                      //    the new value is in range or out of range.  This color is only shown during a
                                      //    navigation that crosses the zero line.

  // For each small multiple…
  function variance(g) {
    g.each(function(d, i) {

      var data = d;
      var g = d3.select(this);

      var markerz = markers.call(this, d, i).slice();

      var chartmax = d.chartRangeMax;
      var chartmin = d.chartRangeMin;
      var chartrange = {chartmax: chartmax, chartmin: chartmin};

      var barheight = height - (height/3);
      var barpositiony = height/6;

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain([chartmin, chartmax])
          .range([0, width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain(x1.domain())
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Derive width-scales from the x-scales.
      var w0 = varianceWidth(x0),
          w1 = varianceWidth(x1);
      var p0 = variancePosition(x0, chartmin),
          p1 = variancePosition(x1, chartmin);

      var scaleForRange = w1;
      var previousScaleForRange = w0;
      var scaleForPosition = p1;
      var previousScaleForPosition = p0;

      // draw a background for the bullet chart
      var background = g.selectAll("rect.tg-variancechart__background")
        .data([chartrange]);
      background.enter().append("rect")
          .attr("class", "tg-variancechart__background")
          .attr("width", function(d){return previousScaleForRange(d.chartmax - d.chartmin);})
          .attr("x", function(d){ 
            return previousScaleForPosition(d.chartmin); 
          });

      background.transition()
          .duration(duration)
          .attr("x", function(d){ 
            return scaleForPosition(d.chartmin); 
          })
          .attr("width", function(d){ 
            return scaleForRange(d.chartmax - d.chartmin); 
          })
          .attr("height", height);

      // draw the acceptable range
      var rangeBottom = null;
      var rangeTop = null;

      // draw the range
      if(d.rangeLow || d.rangeHigh) {
        rangeBottom = d.rangeLow || chartmin;
        rangeTop = d.rangeHigh || chartmax;

        var acceptableRange = g.selectAll("rect.tg-variancechart__range")
            .data([{bottom: rangeBottom, top: rangeTop}]);

        acceptableRange.enter().append("rect")
            .attr("class", "tg-variancechart__range")
            .attr("height", height)
            .attr("width", function(d) {return previousScaleForRange(d.top - d.bottom);})
            .attr("x", function(d) {return previousScaleForPosition(d.bottom);})
            .append("svg:title").text(function(d) {return getToolTip("range", data, d);});

        acceptableRange.transition()
            .duration(duration)
            .attr("x", function(d) {return scaleForPosition(d.bottom);})
            .attr("width", function(d) {return scaleForRange(d.top - d.bottom);})
            .attr("height", height);

        acceptableRange.select("title").text(function(d) {return getToolTip("range", data, d);});
      }

      // draw the negative variance bar (for negative variances)
      var negativeBar = g.selectAll("rect.tg-variancechart__bar--negative")
            .data([d.value]);

        negativeBar.enter().append("rect")
            .attr("class", "tg-variancechart__bar tg-variancechart__bar--negative")
            .style("fill", function(d) {return setBarColor(d, rangeBottom, rangeTop, inRangeColor, outOfRangeColor);})
            .attr("width", 0)
            .attr("height", barheight)
            .attr("x", previousScaleForPosition(0))
            .attr("y", barpositiony)
            .append("svg:title").text(function(d) {return getToolTip("value", data, d);})
          .transition()
            .duration(duration)
            .attr("width", function(d) {return (d < 0) ? scaleForRange(0 - d) : 0;})
            .attr("x", function(d) {return (d < 0) ? scaleForPosition(d) : scaleForPosition(0);});

        negativeBar.transition()
            .duration(duration)
            .attr("width", function(d) {return (d < 0) ? scaleForRange(0 - d) : 0;})
            .attr("height", barheight)
            .attr("x", function(d) {return (d < 0) ? scaleForPosition(d) : scaleForPosition(0);})
            .attr("y", barpositiony);

        negativeBar.select("title").text(function(d) {return getToolTip("value", data, d);});
        
        transitionBarColor(negativeBar, d.value, d.rangeLow, d.rangeHigh, d.value < 0 ? inRangeColor : inRangeColorAlt, d.value < 0 ? outOfRangeColor : outOfRangeColorAlt, duration);

      // draw the positive variance bar (for positive variances)
      var positiveBar = g.selectAll("rect.tg-variancechart__bar--positive")
            .data([d.value]);

        positiveBar.enter().append("rect")
            .attr("class", "tg-variancechart__bar tg-variancechart__bar--positive")
            .style("fill", function(d) {return setBarColor(d, rangeBottom, rangeTop, inRangeColor, outOfRangeColor);})
            .attr("width", 0)
            .attr("height", barheight)
            .attr("x", previousScaleForPosition(0))
            .attr("y", barpositiony)
            .append("svg:title").text(function(d) {return getToolTip("value", data, d);})
          .transition()
            .duration(duration)
            .attr("width", function(d) {return (d > 0) ? 0 : scaleForRange(d);})
            .attr("x", scaleForPosition(0));

        positiveBar.transition()
            .duration(duration)
            .attr("width", function(d) {return (d > 0) ? scaleForRange(d) : 0;})
            .attr("height", barheight)
            .attr("x", scaleForPosition(0))
            .attr("y", barpositiony);

        positiveBar.select("title").text(function(d) {return getToolTip("value", data, d);});

        transitionBarColor(positiveBar, d.value, d.rangeLow, d.rangeHigh, d.value > 0 ? inRangeColor : inRangeColorAlt, d.value > 0 ? outOfRangeColor : outOfRangeColorAlt, duration);

      // draw the zero line
      var marker = g.selectAll("line.tg-variancechart__zero")
          .data([0]);

      marker.enter().append("line")
          .attr("class", "tg-variancechart__zero")
          .attr("x1", function(d) {return scaleForPosition(d); })
          .attr("x2", function(d) {return scaleForPosition(d); })
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6);

      // Update the marker lines.
      marker = g.selectAll("line.tg-variancechart__marker")
          .data(markerz);

      marker.enter().append("line")
          .attr("class", function(d, i) { return "tg-variancechart__marker tg-variancechart__marker--" + i; })
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6)
          .append("svg:title").text(function(d) {return getToolTip("marker", data, d, i);});

      marker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", 0 - height / 6)
          .attr("y2", height + height / 6);

      marker.select("title").text(function(d) {return getToolTip("marker", data, d, i);});

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(5);

      // Update the tick groups.
      var tick = g.selectAll("g.tg-variancechart__tick")
          .data(x1.ticks(5), function(d) {
            return this.textContent || format(d);
          });

      // Initialize the ticks with the old scale, x0.
      var tickEnter = tick.enter().append("g")
          .attr("class", "tg-variancechart__tick")
          .attr("transform", varianceTranslate(x1))
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
          .attr("transform", varianceTranslate(x1))
          .style("opacity", 1);

      tickUpdate.select("line")
          .attr("y1", height)
          .attr("y2", height * 7 / 6);

      tickUpdate.select("text")
          .attr("y", height * 7 / 6);

      // Transition the exiting ticks to the new scale, x1.
      tick.exit().transition()
          .duration(duration)
          .attr("transform", varianceTranslate(x1))
          .style("opacity", 1e-6)
          .remove();

    });
    d3.timer.flush();
  }

  // markers (previous, goal)
  variance.markers = function(x) {
    if (!arguments.length) {
      return markers;
    }
    markers = x;
    return variance;
  };

  variance.width = function(x) {
    if (!arguments.length) {
      return width;
    } 
    width = x;
    return variance;
  };

  variance.height = function(x) {
    if (!arguments.length) {
      return height;
    } 
    height = x;
    return variance;
  };

  variance.tickFormat = function(x) {
    if (!arguments.length) {
      return tickFormat;
    }
    tickFormat = x;
    return variance;
  };

  variance.inRangeColor = function(x) {
    if (!arguments.length) {
      return inRangeColor;
    }
    inRangeColor = x;
    return variance;
  };

  variance.outOfRangeColor = function(x) {
    if (!arguments.length) {
      return outOfRangeColor;
    }
    outOfRangeColor = x;
    return variance;
  };

  variance.duration = function(x) {
    if (!arguments.length) {
      return duration;
    }
    duration = x;
    return variance;
  };

  return variance;
};

function getToolTip(type, data, d, i) {
  var tooltip = "";
  switch(type)  {
    case "value":
      tooltip = data.tooltip || d;
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

function setBarColor(value, rangeBottom, rangeTop, inRangeColor, outOfRangeColor) {
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

function transitionBarColor(d3element, value, rangeBottom, rangeTop, inRangeColor, outOfRangeColor, duration) {
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

function varianceMarkers(d) {
  return d.markers;
}

function varianceTranslate(x) {
  return function(d) {
    return "translate(" + x(d) + ",0)";
  };
}

function varianceWidth(x) {
  var x0 = x(0);
  return function(d) {
    return (x(d) - x0);
  };
}

function variancePosition(x, chartmin) {
  var x0 = x(chartmin);
  return function(d) {
    return (x(d) - x0);
  };
}

})();
