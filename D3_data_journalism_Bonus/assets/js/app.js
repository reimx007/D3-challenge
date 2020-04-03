// set height and width of SVGs
var svgWidth = 960;
var svgHeight = 500;

// set margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// set width and height of chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "obesity";
var chosenYAxis = "income";

// functions used for updating x-scale and y-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis])  * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis])  * 0.9,
      d3.max(data, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// functions used for updating xAxis and yAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// functions used for updating circles and text groups with a transition to
// new y or x locations
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return textGroup;
}
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function renderYText(textGroup, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;
 // create label text based on selected axis
  if (chosenXAxis === "obesity") {
    xlabel = "Obesity %:";
  }
  else {
    xlabel = "Smoking %:";
  }
  if (chosenYAxis === "income") {
    ylabel = "MHI:";
  }
  else {
    ylabel = "Poverty %:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}
        <br>${ylabel} ${d[chosenYAxis]}`);
    });
// call tooltip
  circlesGroup.call(toolTip);

// create event listeners to display tooltips
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.income = +data.income;
    // console.log(data.income);
    data.obesity = +data.obesity;
    // console.log(data.obesity);
    data.smokes = +data.smokes;
    // console.log(data.smokes);
    data.poverty = +data.poverty;
    // console.log(data.poverty);
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .call(leftAxis);
  // chartGroup.append("g")
  //   .call(leftAxis);

  // Create group for  2 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, ${height / 2})`);

  var incomeLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 200 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Median Household Income");

  var povertyLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 200 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty %");

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 13)
    .attr("fill", "#44c8f5")
    .attr("opacity", ".5");

// append initial text
  var textGroup = chartGroup.append('g')
    .selectAll('text')
    .data(data)
    .enter().append('text')
    .attr("class", "circleText")
    .text(d => d.abbr)
    .attr('font-size',8)//font size
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]))
    .attr('dx', -6)
    .attr('dy', 3);

  // append data source text
    var textSource = chartGroup.append('g')
      .selectAll('text')
      .data(data)
      .enter().append('text')
      .attr("class", "source")
      .text("Data source: 2014 ACS, Census Bureau")
      .attr('font-size',10)
      .attr('x', 0)
      .attr('y', svgHeight-60)


  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height+ 20})`);

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity %");

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smoking %");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates cirle labels with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates cirle labels with new y values
        textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
