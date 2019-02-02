var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append on SVG group

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params

var chosenXAxis = "poverty";
// var chosenYAxis = "noHealthInsurance";


// function used for updating x-scale var upon click on axis label

function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

  }


// function used for updating y-scale var upon click on axis label

// function yScale(stateData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//       .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
//         d3.max(stateData, d => d[chosenYAxis]) * 1.2
//       ])
//       .range([height, 0]);
  
//     return yLinearScale;
  
//   }

// function used for updating xAxis & yAxis vars upon click on axis label

function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function renderAxis(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);

//     YAxis.transition()
//         .duration(1000)
//         .call(leftAxis);
    
//     return yAxis;
// }

console.log("axis rendered");
// function used for updating circles group with a transition to
// new circles

function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
        // .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}


// function used for updating circles group with new tooltip



function updateToolTip(chosenXAxis, circlesGroup) {
    
    if (chosenXAxis === "poverty") {
        var label = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var label = "Age (Median)";
    }
    else {
        var label = "Household Income (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([0, 0])
        .html(function (d) {
            return (`${d.state}<br>${d[chosenXAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })

    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
      });

    return circlesGroup;
}






// NEED FOR Y UPDATES**************** IS THIS RIGHT?

// function updateToolTip2(chosenYAxis, circlesGroup) {
    
//     if (chosenXAxis === "poverty") {
//         var label = "In Poverty (%)";
//     }
//     else if (chosenXAxis === "age") {
//         var label = "Age (Median)";
//     }
//     else {
//         var label = "Household Income (Median)";
//     }

//     var toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function (d) {
//             return (`${d.state}<br>${d[chosenXAxis]}<br>${d[chosenYAxis]}`)
//         });
    
//     circlesGroup.call(toolTip);

//     circlesGroup.on("mouseover", function (data) {
//         toolTip.show(data);
//     });

//     return circlesGroup;
// }



console.log("updates circles");



// Retrieve data from the CSV file and execute everything below

d3.csv("assets/data/data.csv").then(function (stateData) {
    
    // parse data
    stateData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.noHealthInsurance = +data.noHealthInsurance;
        data.smokes = +data.smokes;
    });
    
    // console.log("retrieve data:", stateData);
    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    //  // ylinearScale function from above csv import
    // var yLinearScale = yScale(stateData, chosenYAxis);
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => d.noHealthInsurance)])
        .range([height, 0]);
    

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    //append y axis
    // var yAxis = chartGroup.append("g")
    //     .classed("y-axis", true)
    //     .attr("transform", `translate(${width},0)`)
    //   .call(leftAxis);
  
    chartGroup.append("g")
        .call(leftAxis);
    
    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.noHealthInsurance))
        .attr("r", 15)
        .attr("fill", "green")
        .text(stateData.abbr)
        .attr("opacity", ".5");
    
    chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .selectAll("tspan")
        .data(stateData)
        .enter()
        .append("tspan")
            .attr("cx", function(data) {
                return xLinearScale(d => xLinearScale(d[chosenXAxis]- 0));
            })
            .attr("cy", function(data) {
                return yLinearScale(data.noHealthInsurance - 0.2);
            })
            .text(function(data) {
                return data.abbr
            });
        
    
    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // Create group for 3 y-axis labels
    // var yLabelsGroup = chartGroup.append("g")
    //     .attr("transform", `translate(0, ${height / 2})`);
    
    // var noHealthInsuranceLabel = yLabelsGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("x", 40)
    //     .attr("y", 0)
    //     .attr("value", "noHealthInsurance")
    //     .classed("active", true)
    //     .text("Lacks Healthcare (%)")
    
    // var smokesLabel = yLabelsGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("x", 20)
    //     .attr("y", 0)
    //     .attr("value", "smokes")
    //     .classed("inactive", true)
    //     .text("Smokes (%)")
    
    // var obesityLabel = yLabelsGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("value", "obesity")
    //     .classed("inactive", true)
    //     .text("Obese (%)")

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left-150)
        .attr("x", 0 - 2*(height / 3))
        .attr("dy", "1em")
        .classed("axis-text", true)    
        .text("Lacks Healthcare (%)");
    
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
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
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
      
      
      
      
    // y axis labels event listener
  // yLabelsGroup.selectAll("text")
  // .on("click", function() {
  //   // get value of selection
  //   var value = d3.select(this).attr("value");
  //   if (value !== chosenYAxis) {

  //     // replaces chosenXAxis with value
  //     chosenYAxis = value;

  //     console.log("chosen y axis:", chosenYAxis)

  //     // functions here found above csv import
  //     // updates x scale for new data
  //     yLinearScale = yScale(stateData, chosenYAxis);

  //     // updates x axis with transition
  //     yAxis = renderAxes(yLinearScale, yAxis);

  //     // updates circles with new y values
  //     circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

  //     // updates tooltips with new info
  //     circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

  //     // changes classes to change bold text
  //     if (chosenYAxis === "noHealthInsurance") {
  //       noHealthInsuranceLabel
  //         .classed("active", true)
  //         .classed("inactive", false);
  //       smokesLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //       obesityLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //     }
  //     else if(chosenXAxis === "smokes") {
  //       noHealthInsuranceLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //       smokesLabel
  //         .classed("active", true)
  //         .classed("inactive", false);
  //       obesityLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //     }
  //     else {
  //       noHealthInsuranceLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //       smokesLabel
  //         .classed("active", false)
  //         .classed("inactive", true);
  //       obesityLabel
  //         .classed("active", true)
  //         .classed("inactive", false);
  //       }
  //   }
  // });
});