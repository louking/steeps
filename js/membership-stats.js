var margin = {top: 40, right: 80, bottom: 45, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    viewbox_width = width + margin.left + margin.right,
    viewbox_height = height + margin.top + margin.bottom;

var parseDate = d3.timeFormat("%d-%b-%y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

// see https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915
var xAxis = d3.axisBottom(x)
    .tickSize(16)
    .tickFormat(d3.timeFormat("%b"));

var yAxis = d3.axisLeft(y);

// copied from matplotlib v2.0 - see https://matplotlib.org/users/dflt_style_changes.html#colors-in-default-property-cycle
var colorcycle = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
              '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
              '#bcbd22', '#17becf'];
var color = d3.scaleOrdinal()
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
              '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
              '#bcbd22', '#17becf']);

var line = d3.line()
    .x(function(d) { 
      return x(d.date); })
    .y(function(d) { 
      return y(d.count); });

var entry_content = d3.select(".entry-content")

var svg = entry_content
  .append("svg")
    .attr("class", "chart")
    .attr("width", viewbox_width)
    .attr("height", viewbox_height)
    .attr("viewBox", "0 0 " + viewbox_width + " " + viewbox_height)
    .attr("preserveAspectRation", "xMidYMid")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// make responsive, fit within parent
var aspect = viewbox_width / viewbox_height,
    chart = d3.select(".chart"),
    entrycontent = d3.select(".entry-content");
window.onresize = function() {
    var targetWidth = parseFloat(entrycontent.style("width"));  // assumes width in px
    chart.attr("width", targetWidth);
    chart.attr("height", targetWidth / aspect);
};

var mouseoverlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width + margin.right)
    .attr("height", height);

var formatDate = d3.timeFormat("%m/%d"); 
var parseDate = d3.timeParse("%m-%d"),
    jan1 = parseDate("01-01"),
    dec31 = parseDate("12-31");
x.domain([jan1, dec31]);

d3.json("/api/_memberstats", function(error, contents) {
  if (error) throw error;
  if (!contents.success) throw "error response from api";

  data = contents.data;
  cachetime = contents.cachetime;

  // do this before parsing all the dates
  var lastyearcounts = data[data.length-1]
      lastyear = lastyearcounts.year,
      lastcounts = lastyearcounts.counts;

  // data is [{year:year, counts: {['date':date, 'count':count}, ... ]}, ... ]
  // alldata is concatenation of all years' data for y.domain(d3.extent)
  alldata = [];
  for (i=0; i<data.length; i++) {
    data[i].counts.forEach(function(d) {
      d.date = parseDate(d.date);
      d.count = +d.count;
    });
    alldata = alldata.concat(data[i].counts);
  };

  // y.domain(d3.extent(alldata, function(d) { return d.count; }));
  y.domain([0, Math.ceil(d3.max(alldata, function(d) { return d.count})/100)*100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", 6)
      .attr("y", 6);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Num Members");

  svg.append("g")
      .attr("class", "heading")
    .append("text")
      .attr("transform", "translate(" + width/2 + ",-10)")
      .style("text-anchor", "middle")
      .text("year on year member count as of " + cachetime);

  colormap = [];
  for (i=0; i<data.length; i++) {
    year = data[i].year
    colormap.push({'year': year, 'color': colorcycle[i % colorcycle.length]});

    svg.append("path")
        .style("stroke", colormap[i].color)
        .datum(data[i].counts)
        .attr("class", "line")
        .attr("d", line);

    var thisfocus = svg.append("g")
        .attr("class", "focus")
        .attr("id","focus"+i)
        .style("display", "none");

    thisfocus.append("circle")
        .attr("r", 4.5);

    thisfocus.append("text")
        .style("text-anchor", "start")
        .attr("x", 4)
        .attr("y", 7)
        .attr("dy", ".35em");
  }

  var legend = svg.selectAll(".legend")
      .data(colormap)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + i * 90 + ",0)"; });

  legend.append("rect")
      .attr("y", height + margin.bottom - 15)
      .attr("x", 60)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", function(d) { return d.color });

  legend.append("text")
      .attr("x", 15)
      .attr("y", height + margin.bottom - 15)
      .attr("dy", ".8em")
      .style("text-anchor", "bottom")
      .text(function(d) { return d.year; });

  var allfocus = d3.selectAll(".focus");
  mouseoverlay
    .on("mouseover", function() { allfocus.style("display", null); })
    .on("mouseout", function() { allfocus.style("display", "none"); })
    .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    for (i=0; i<data.length; i++) {
      var j = bisectDate(data[i].counts, x0, 1);
      // use d0, d1 if in range
      if (j < data[i].counts.length) {
        var d0 = data[i].counts[j - 1],
            d1 = data[i].counts[j];
        var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      }
      else {
        var d = data[i].counts[data[i].counts.length-1]
      }
      var thisfocus = d3.select("#focus"+i);
      thisfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.count) + ")");
      thisfocus.select("text").text(formatDate(d.date) + " " + d.count);
    }
  }
});
