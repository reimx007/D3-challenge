// set height and width of SVGs
var svgWidth = 960;
var svgHeight = 500;

// set margins
var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

// set width and height of chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function(data) {

    // Parse Data/Cast as numbers
    data.forEach(function(data) {
      // data.abbr = data.abbr;
      data.income = +data.income;
      console.log(data.income);
      data.obesity = +data.obesity;
      console.log(data.obesity);
    });

    //  set scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.obesity)-1, d3.max(data, d => d.obesity)+2])
      .range([0, width]);

    // console.log(xLinearScale);
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.income)- 2000, d3.max(data, d => d.income)])
      .range([height, 0]);
    // console.log(yLinearScale);

      // create axes
      var xAxis = d3.axisBottom(xLinearScale);
      var yAxis = d3.axisLeft(yLinearScale);

      // append axes to a the chart
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      chartGroup.append("g")
        .call(yAxis);

      // create the circle groups
      var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.obesity))
        .attr("cy", d => yLinearScale(d.income))
        .attr("r", "10")
        .attr("fill", "#44c8f5")
        .attr("opacity", ".5");

      // create the text groups (state labels)
      var textGroup = chartGroup.append('g')
        .selectAll('text')
        .data(data)
        .enter().append('text')
        .attr("class", "circleText")
        .text(d => d.abbr)
        .attr('font-size',8)
        .attr('x', d => xLinearScale(d.obesity))
        .attr('y',d => yLinearScale(d.income))
        .attr('dx', -6)
        .attr('dy', 3);

      // create the tooltips
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br>Obesity %: ${d.obesity}<br> HH Income: ${d.income}`);
        });

      // CAll tooltip in the chart
      chartGroup.call(toolTip);

      // Create event listeners to display and hide the tooltip, for both the circles and text
      circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

      textGroup.on("click", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

        // Create axes labels
      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Percent of population in obesity");

      chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("Median household income");
  }).catch(function(error) {
    console.log(error);
  });
