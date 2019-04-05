/**
 * CountryScan50 v1.1 by Francis Murray
 * Harvard CS50x Final Project
 *
 * Description:
 *  > This WebApp helps visualize the World Population by country, age and gender.
 *  > It uses D3 JavaScript library to bring the data to life.
 *
 * Credits and special thanks:
 *
 *  > Data Source:
 *  > > World Population API gracefully provided by World Data Lab (https://www.worlddata.io/)
 *
 *  > D3 code inspiration:
 *  > > Mike Bostock, Key developer of D3.js
 *  > > Scott Murray, D3 Tutorials
 *  > > Christoph Körner, Learning Responsive Data Visualization
 *  > > Justin Freels, Block 6734025
 *  > > Jonah Williams, Block 2f16643b999ada7b1909
 *  > > Athena Braun, "Data Visualization with D3"
 *  > > Michael Menz, "Data Visualization with D3"
 */

// Code will run once the page DOM is ready
$( document ).ready(function() {

    // Alert with instructions to user
    $('#graph_title').html("<div class='alert alert-success' role='alert'>Select a country and year and click on the Search button to view the population by age</div>");
    $('.alert').hide().fadeIn( 700 );

    // Code executed when the user clicks on the Search button
    $('#formulaire').submit(function() {

        // Retrieve population tables from World Population API for the year and country submitted through the form
        var url = "https://dyicn1e62j3n1.cloudfront.net:443/1.0/population/" + $('#year option:selected').val() + "/" + $('#country option:selected').val() + "/";

        // Shorthand Ajax function that returns JSON-encoded data using a GET HTTP request
        $.getJSON(url, function(data) {

            // Generate chart title based on year and country submitted
            $('#graph_title').html("<h2>" + $('#country option:selected').val() + " " + $('#gender option:selected').text().toLowerCase() + " population by age in " + $('#year option:selected').val() + "<h2>");

            // Generate the table with default columns
            tabulate(data, ['age', 'total']);

            // Draw the bar chart
            draw(data);

            // Re-draw the bar chart if the window resizes
            window.addEventListener('resize', function(event){
                draw(data);
            });
        })
        .done(function() {
            console.log( "success" );
        })
        .fail(function() {
            console.log( "error" );
            // remove the gender dropdown menu, the chart and the table
            $('#gender-drop').empty();
            $('#chart').empty();
            $('#table-div').empty();

            // alert
            $('#graph_title').html("<div class='alert alert-danger' role='alert'>Sorry, there is no data for this country and year</div>");
            $('.alert').hide().fadeIn( 700 );
        })
        .always(function() {
            console.log( "complete" );
        });

        // Cancel the form submit action
        return false;
    })
})


/**
  * Function that generates and returns an HTML table (adapted from Justin Freels’s Block 6734025)
  */
function tabulate(data, columns) {

    $('#table-div').empty();

    // Generate the table HTML structure
    var table = d3.select('#table-div')
        .append('table')
        .attr('class', 'table table-sm');
    var thead = table
        .append('thead')
        .attr('class', 'thead-light');
    var	tbody = table
        .append('tbody');

    // Append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column; });

    // Create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // Create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]};
        });
      })
      .enter()
      .append('td')
      .text(function (d) { return d3.format(',')(d.value); });

  return table;
}


/**
 * Function that draws a D3 bar chart visualization of the population by age
 */
function draw(data) {

    // Get every key of the data's JSON object
    var data_keys = Object.keys(data[0]);

    // Create an array with the keys relating to gender
    var data_gender_keys = [data_keys[5], data_keys[0], data_keys[3]];

    // Default selected value for dropdown menu
    var selection = data_gender_keys[0];

    // clear the previous divs
    $('#chart').empty();
    $('#gender-drop').empty();

    // Configure height, width and margins of the visualization
    var ratio = 0.6;
    var chart = document.getElementById('chart');
    var width = chart.clientWidth;
    var height = width * ratio;
    var pad = width * 0.14;

    // SVG drawing canvas
    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create scales
    var xScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d){ return d.age; })])
        .range([pad, width - pad]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d){ return +d[selection]; })])
        .range([height - pad, pad]);

    // Setting up the axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(10);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(10)
        .tickFormat(d3.format('.2s'));

    // Append the axes to the svg
    var axesGroup = svg.append('g')
        .attr('class', 'axis');

    // Append the x axis
    axesGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - pad) + ')')
        .call(xAxis);

    // Text label for the x axis
    axesGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-style', 'italic')
        .attr('transform', 'translate(' + (width/2) + ' , ' + (height - pad + 40) + ')')
        .text('Age');

    // Append the y axis
    axesGroup.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + pad + ')')
        .call(yAxis);

    // Text label for the y axis
    axesGroup.append('text')
        .attr('text-anchor', 'middle')  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr('font-style', 'italic')
        .attr('transform', 'translate(' + (pad/3) + ' , ' + (height/2) + ')rotate(-90)')
        .text('Population');

    // Define bar width
    var barWidth = (width - (2 * pad)) / (data.length + 1);

    // Draw the bars
    var bars = svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'rectangle')
        .attr('x', function(d, i) { return xScale(d.age); })
        .attr('y', function(d) { return yScale(+d[selection]); })
        .attr('height', function(d) { return yScale(0) - yScale(+d[selection]); })
        .attr('width', barWidth)
        .on('mouseover', function(d) {
            var array = [d]; // put the one datum in an array in order to pass it to tabulate
            tabulate(array, ['age', selection.value]);
        })
        .on('mouseout', function(d) {
            tabulate(data, ['age', selection.value]);
        });

    // Interactive Bar Chart (adapted from Jonah Williams’s Block 2f16643b999ada7b1909)
    var selector = d3.select('#gender-drop')
        .append('select')
        .attr('class' , 'form-control gender-drop')
        .attr('id','dropdown')
        .on('change', function(d){
            selection = document.getElementById('dropdown');
            tabulate(data, ['age', selection.value]);

            d3.selectAll('.rectangle')
                .transition()
                .attr('height', function(d) { return yScale(0) - yScale(+d[selection.value]); })
                .attr('width', barWidth)
                .attr('x', function(d, i ) { return xScale(d.age); })
                .attr('y', function(d) { return yScale(+d[selection.value]); })
                .ease('linear');

            d3.selectAll('g.y.axis')
                .transition()
                .call(yAxis);
         });

    // Populate gender dropdown menu
    selector.selectAll('option')
        .data(data_gender_keys)
        .enter()
        .append('option')
        .attr('value', function(d){ return d; })
        .text(function(d){ return d; })
        .property('selected', function(d){ return d === 'total'; });

    selection = document.getElementById('dropdown');
};
