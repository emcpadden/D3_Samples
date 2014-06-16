(function(d3) {
	d3.tgTrendChart = function() {
		var duration = 800,
			width = 500,
			height = 200,
			trendData = trendChartData,
			legendInfo = [],
			tickFormat = null,
			tooltipFormat = null;

		function trend(g) {
			g.each(function(d,i) {
				var data = trendData.call(this, d, i).slice();

			});
			d3.timer.flush();
		}

		trend.legendInfo = function(d) {
		    if (!arguments.length) {
		      return legendInfo;
		    }
		    legendInfo = d;
		    return trend;
		};

		trend.width = function(x) {
			if (!arguments.length) {
			  return width;
			} 
			width = x;
			return trend;
		};

		trend.height = function(x) {
			if (!arguments.length) {
			  return height;
			} 
			height = x;
			return trend;
		};

		trend.tickFormat = function(x) {
			if (!arguments.length) {
			  return tickFormat;
			}
			tickFormat = x;
			return trend;
		};

		trend.tooltipFormat = function(x) {
			if (!arguments.length) {
			  return tooltipFormat;
			}
			tooltipFormat = x;
			return trend;
		};

		trend.duration = function(x) {
			if (!arguments.length) {
			  return duration;
			}
			duration = x;
			return trend;
		};

		return trend;

	};

	function trendChartData(d) {
	  var trendData = [];
	  if(typeof d !== 'undefined' && d instanceof Array) {
	    trendData = d;
	  }

	  

	  return trendData;
	}


})(d3);
