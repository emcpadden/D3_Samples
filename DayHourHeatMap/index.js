var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = $("#chart").width() - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize*2,
    buckets = 9,
    //colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    colors = ["#5E4FA2","#3288BD","#66C2A5","#ABDDA4","#E6F598","#f6faaa","#FEE08B","#FDAE61","#F46D43", "#D53E4F", "#9E0142"], // alternatively colorbrewer.YlGnBu[9]
    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
var svg = null;
var heatMap = null;
var colorScale = null;
var datafile = "data-1.tsv";

$(".changeDataBtn").on('click', function(){
  datafile = $(this).data('file');
  update();
});

function update() {
d3.tsv(datafile,
  function(d) {
    return {
      day: +d.day,
      hour: +d.hour,
      value: +d.value
    };
  },
  function(error, data) {

  function tweenCenter(d, i, a) {
    return d3.interpolateString("translate(0,0)", "translate(" + (gridSize/3) + ",0)");
  }
  function tweenBack(d, i, a) {
    return d3.interpolateString("translate(" + (gridSize/3) + ",0)", "translate(0,0)");
  }

  heatMap = svg.selectAll(".hour")
      .data(data)
      .transition()
      .delay(function(d, i) { return (((d.hour)/24 * 500) + (d.day / 7 * 300)); })
      .duration(300)
      .attrTween("transform", tweenCenter)
      .transition()
      .duration(300)
      .style("fill", function(d, i) { return colorScale(d.value); })
      .delay(function(d, i) { return (((d.hour)/24 * 500) + (d.day / 7 * 300)); })
      .transition()
      .duration(200)
      .attrTween("transform", tweenBack)
      .transition();
  });

/*
  heatMap = svg.selectAll(".hour")
      .data(data)
      .transition()
      //.delay(function(d, i) { return (Math.random() * 200 + ((d.hour)/24 * 300) + (d.day / 7 * 500)); })
      .delay(function(d, i) { return (((d.hour)/24 * 500) + (d.day / 7 * 300)); })
      //.duration(300)
      //.attr("width", 0)
      .attrTween("transform", tweenCenter)
      .transition()
      .style("fill", function(d, i) { return colorScale(d.value); })
      //.transition().duration(300)
      //.attr("width", gridSize)
      .delay(function(d, i) { return (((d.hour)/24 * 500) + (d.day / 7 * 300)); })
      .transition().duration(200)
      .attrTween("transform", tweenBack)
      .transition();
  });
*/
}

function init() {
d3.tsv(datafile,
  function(d) {
    return {
      day: +d.day,
      hour: +d.hour,
      value: +d.value
    };
  },
  function(error, data) {
svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
        .range(colors);

    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", function (d, i) { return i * gridSize; })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
          .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
          .text(function(d) { return d; })
          .attr("x", function(d, i) { return i * gridSize; })
          .attr("y", 0)
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + gridSize / 2 + ", -6)")
          .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    heatMap = svg.selectAll(".hour")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

    heatMap.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.value); });

    heatMap.append("title").text(function(d) { return d.value; });
        
    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; })
        .enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + gridSize);
});
}

init();

