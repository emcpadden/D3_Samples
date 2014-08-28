// tgSingleBarChart
// This is a D3 Plugin for drawing a Bullet Chart using D3

//==============================================================================
// This requires D3.  Go to http://d3js.org/ to download a copy of D3.js or use
// bower to retrieve a copy:
//  bower install d3
//
// this also requires tgUtilities.js which is also part of tgJS
//==============================================================================

//==============================================================================
// IMPORTANT:  This control is currently being used as part of the Matrix Demo
// project and is subject to change.  Use at your own risk.
//==============================================================================


//==============================================================================
// The data format for this plug in is as follows:
// (note: any additional propertyies will be ignored):
// {
//    "value": 72,  // This is the value of the center bullet
//    "maxValue": 100 // this is the max value that should be limit the upper end of the chart.  Parts of the value that exceed this are not displayed.  
//    "minValue": 0 // [OPTIONAL] this is the min value that should be limit the lower end of the chart.  Parts of the value that is below this are not displayed.  
//    "rangeLow": 60, // [OPTIONAL] this is the low end of the acceptable range, if this is missing it is set to zero
//    "rangeHigh": 75, // [OPTIONAL] the high end of the acceptable range, if this is missing it is set to the highest value so that there effectively is no limit on the upper end
// }


/* global d3:true */
(function(d3) {

d3.tgSingleBarChart = function() {
  var reverse = false,
      duration = 800,
      width = 300,
      height = 30,
      topBottomBarMargin = 3,
      valuePropertyName = "value",
      maxValuePropertyName = "max",
      minValuePropertyName = "min",
      rangeLowPropertyName = "rangeLow",
      rangeHighPropertyName = "rangeHigh",
      inRangeColor = "#295FDE",
      outOfRangeColor = "#DD0110";

  function bar(g) {
    g.each(function(d, i) {
      if(i === 0) {
        // we only support a single bar
      

      var data = d;
      var g = d3.select(this);
      var value = window.tgUtilities.resolveMember(d, valuePropertyName, 0);
      var chartMax = window.tgUtilities.resolveMember(d, maxValuePropertyName, 100);
      var chartMin = window.tgUtilities.resolveMember(d, minValuePropertyName, 0);
      var rangeLow = window.tgUtilities.resolveMember(d, rangeLowPropertyName, chartMin);
      var rangeHigh = window.tgUtilities.resolveMember(d, rangeHighPropertyName, chartMax);

      var topBottomBarMarginAdjusted = topBottomBarMargin;
      if((2*topBottomBarMarginAdjusted) > (height - 2*topBottomBarMarginAdjusted)) {
        topBottomBarMarginAdjusted = Math.floor((height - 2*topBottomBarMarginAdjusted)/2.0);
        if(topBottomBarMarginAdjusted < 0) {
          topBottomBarMarginAdjusted = 0; 
        }
      }

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain([chartMin, chartMax])
          .range([0, width]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Derive width-scales from the x-scales.
      var w0 = barWidth(x0, chartMin),
          w1 = barWidth(x1, chartMin);

      // draw a background for the bullet chart
      var background = g.selectAll("rect.tg-singlebarchart__background")
        .data([chartMax]);
      background.enter().append("rect")
          .attr("class", "tg-singlebarchart__background")
          .attr("width", w1)
          .attr("x", 0);

      background.transition()
          .duration(duration)
          .attr("x", 0)
          .attr("width", w1)
          .attr("height", height);

      var valueBar = g.selectAll("rect.tg-singlebarchart__value")
          .data([value]);

      valueBar.enter().append("rect")
          .attr("class", "tg-singlebarchart__value")
          .style("fill", function(d/*, i*/) {return setBarColor(d, rangeLow, rangeHigh, inRangeColor, outOfRangeColor);})
          .attr("width", w0)
          .attr("height", height - 2*topBottomBarMarginAdjusted)
          .attr("x", 0)
          .attr("y", topBottomBarMarginAdjusted)
        .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", 0);

      valueBar.transition()
          .duration(duration)
          .attr("width", w1)
          .attr("height", height - 2*topBottomBarMarginAdjusted)
          .attr("x", 0)
          .attr("y", topBottomBarMarginAdjusted);

      transitionBarColor(valueBar, value, rangeLow, rangeHigh, inRangeColor, outOfRangeColor, duration);

      }
      else {
        var warning = "The tgSingleBarChart only supports one data item";

        try {
          window.console.warn(warning);
        }
        catch(e) {
          window.console.log(e.message);
          window.console.log(warning);
        }        
      }

    });
    d3.timer.flush();
  }

  bar.width = function(x) {
    if (!arguments.length) {
      return width;
    } 
    width = x;
    return bar;
  };

  bar.height = function(x) {
    if (!arguments.length) {
      return height;
    } 
    height = x;
    return bar;
  };

  bar.inRangeColor = function(x) {
    if (!arguments.length) {
      return inRangeColor;
    }
    inRangeColor = x;
    return bar;
  };

  bar.outOfRangeColor = function(x) {
    if (!arguments.length) {
      return outOfRangeColor;
    }
    outOfRangeColor = x;
    return bar;
  };

  bar.duration = function(x) {
    if (!arguments.length) {
      return duration;
    }
    duration = x;
    return bar;
  };

  bar.valuePropertyName = function(x) {
    if (!arguments.length) {
      return valuePropertyName;
    }
    valuePropertyName = x;
    return bar;
  }

  bar.maxValuePropertyName = function(x) {
    if (!arguments.length) {
      return maxValuePropertyName;
    }
    maxValuePropertyName = x;
    return bar;
  }

  bar.minValuePropertyName = function(x) {
    if (!arguments.length) {
      return minValuePropertyName;
    }
    minValuePropertyName = x;
    return bar;
  }

  bar.rangeLowPropertyName = function(x) {
    if (!arguments.length) {
      return rangeLowPropertyName;
    }
    rangeLowPropertyName = x;
    return bar;
  }

  bar.rangeHighPropertyName = function(x) {
    if (!arguments.length) {
      return rangeHighPropertyName;
    }
    rangeHighPropertyName = x;
    return bar;
  }

  bar.topBottomBarMargin = function(x) {
    if (!arguments.length) {
      return topBottomBarMargin;
    }
    topBottomBarMargin = x;
    return bar;
  }

  return bar;
};

function setBarColor(value, rangeLow, rangeHigh, inRangeColor, outOfRangeColor) {
  var color = inRangeColor;
  var outOfRange = false;
  if(rangeLow > value) {
    outOfRange = true;
  }
  if(rangeHigh < value) {
    outOfRange = true;
  }
  if(outOfRange) {
    color = outOfRangeColor;
  }
  else {
    color = inRangeColor;
  }
  return color;
}

function transitionBarColor(d3element, value, rangeLow, rangeHigh, inRangeColor, outOfRangeColor, duration) {
  var outOfRange = false;
  if(rangeLow > value) {
    outOfRange = true;
  }
  if(rangeHigh < value) {
    outOfRange = true;
  }
  if(outOfRange) {
    d3element.transition().delay(duration).duration(duration).style("fill", outOfRangeColor);
  }
  else {
    d3element.transition().delay(duration).duration(duration).style("fill", inRangeColor);
  }
}

function barWidth(x, chartMin) {
  var x0 = x(chartMin);
  return function(d) {
    var width = x(d) - x0;
    if(width < 0) {
      width = 0;
    }
    return width;
  };
}

})(d3);
