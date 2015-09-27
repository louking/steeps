var margin = {top: 20, right: 70, bottom: 35, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.months)
    .tickSize(16)
    .tickFormat(d3.time.format("%b"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// copied from matplotlib
var colorcycle = ['blue', 'green', 'red', 'cyan', 'magenta', 'yellow', 'black'];
var color = d3.scale.ordinal()
    .range(['blue', 'green', 'red', 'cyan', 'magenta', 'yellow', 'black']);

var line = d3.svg.line()
    .x(function(d) { 
      return x(d.date); })
    .y(function(d) { 
      return y(d.nummembers); });

var svg = d3.select(".entry-content").append("svg")
    .attr("class", "chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var mouseoverlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var formatDate = d3.time.format("%m/%d"); 
var parseDate = d3.time.format("%m-%d").parse,
    jan1 = parseDate("01-01"),
    dec31 = parseDate("12-31");
x.domain([jan1, dec31]);

d3.json("/wp-content/uploads/membership/membership-stats.json", function(error, data) {
  if (error) throw error;

  // data is object by year of list of objects by {'date':date, 'nummembers':nummembers}
  // alldata is concatenation of all years' data for y.domain(d3.extent)
  alldata = [];
  for (var year in data) {
    data[year].forEach(function(d) {
      d.date = parseDate(d.date);
      d.nummembers = +d.nummembers;
    });
    alldata = alldata.concat(data[year]);
  };

  // y.domain(d3.extent(alldata, function(d) { return d.nummembers; }));
  y.domain([0, Math.ceil(d3.max(alldata, function(d) { return d.nummembers})/100)*100]);

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

  var index = 0;
  colormap = [];
  for (var year in data) {
    colormap.push({'year': year, 'color': colorcycle[index % colorcycle.length]});

    svg.append("path")
        .style("stroke", colormap[index].color)
        .datum(data[year])
        .attr("class", "line")
        .attr("d", line);

    var thisfocus = svg.append("g")
        .attr("class", "focus")
        .attr("id","focus"+index)
        .style("display", "none");

    thisfocus.append("circle")
        .attr("r", 4.5);

    thisfocus.append("text")
        .style("text-anchor", "start")
        .attr("x", 4)
        .attr("y", 7)
        .attr("dy", ".35em");

    index += 1;
  }

  var legend = svg.selectAll(".legend")
      .data(colormap)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + i * 80 + ",0)"; });

  legend.append("rect")
      .attr("y", height + margin.bottom - 10)
      .attr("x", 50)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", function(d) { return d.color });

  legend.append("text")
      .attr("x", 20)
      .attr("y", height + margin.bottom - 10)
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
    var index = 0;
    for (var year in data) {
      var i = bisectDate(data[year], x0, 1);
      // use d0, d1 if in range
      if (i < data[year].length) {
        var d0 = data[year][i - 1],
            d1 = data[year][i];
        var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      }
      else {
        var d = data[year][data[year].length-1]
      }
      var thisfocus = d3.select("#focus"+index);
      thisfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.nummembers) + ")");
      thisfocus.select("text").text(formatDate(d.date) + " " + d.nummembers);

      index += 1;
    }
  }
});