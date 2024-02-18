document.addEventListener('DOMContentLoaded', function(){
  
    const req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
    req.send();
    req.onload=function(){
    const json = JSON.parse(req.responseText);
      console.log(json);
    const dataset = json.monthlyVariance.map((item) => [
      item.year,
      item.month,
      item.variance
    ]);
      
      createHeatmap(dataset);
    };
    });
    
    
    function createHeatmap(dataset) {
      
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
    const legendTicks = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
    
    const colors = ["#000066","#000099", "#0066cc", "#0099ff", "#ccffff","#ffffcc", "#ffff66", "#ffcc00", "#ff6600", "#ff0000"];
      
    const h = 500;
    const w = 1600;
    const padding = 60;
    
    const h2 = 60;
    const w2 = 600;
    const p2 = 30;
    const svgHeight = h + h2;
    
      
    const cellWidth = 4; 
    const cellHeight = 30;
      
    const parseYear = d3.timeParse("%Y");
      
      dataset.forEach((d) => {
      d[0] = parseYear(d[0]);
    });
      
    const minYear = d3.min(dataset, (d) => d[0].getFullYear());
    const maxYear = d3.max(dataset, (d) => d[0].getFullYear());
    
    
    const startYear = Math.floor(minYear / 10) * 10;
    const step = 10;
    
    const tickValues = [];
    for (let year = startYear; year <= maxYear; year += step) {
      tickValues.push(year);
    }
    
    const xScale = d3.scaleTime()
      .domain([new Date(startYear, 0, 1), new Date(maxYear, 0, 1)])
      .range([padding, w - padding]);
    
     const yScale = d3.scaleBand()
                      .domain(monthNames)
                      .range([h - padding, padding + 10]);
     
    const scaleLegend = d3.scaleLinear()
                          .domain([d3.min(legendTicks), d3.max(legendTicks)])
                          .range([p2, w2 - p2]);
      
     const colorScale = d3.scaleThreshold()
        .domain(legendTicks.slice(0, -1)) 
        .range(colors);
     
      
    const heatmapContainer = d3.select("#heat-map");
    const svg = heatmapContainer
      .append("svg")
      .attr("width", w)
      .attr("height", svgHeight)
    
    const tooltip = heatmapContainer
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("color", "white") // Set font color to white
        .style("background", "black")
        .style("padding", "10px")
        .attr("data-year", "");
    
    d3.select("svg").selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(monthNames[d[1] - 1])) 
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("fill", (d) => colorScale(d[2] + 8.66))
      .attr("stroke", "black")
      .attr("stroke-width", 1) 
      .attr("stroke-opacity", 0.5)
      .attr("data-year", (d) => {
        const year = d[0].getFullYear();
        if (year >= minYear && year <= maxYear) {
          return year;
        } else {
          return "Out of range";
        }
      })
      .attr("data-month", (d) => {
        const month = d[1];
        if (month >= 1 && month <= 12) {
          return month;
        } else {
          return "Out of range";
        }
      });
      
      d3.selectAll(".cell")
      .on("mouseover", function(event, d) {
         const year = d[0].getFullYear();
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(d[0].getFullYear() + "<br>" + d[1] + "<br>" + d[2])
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px")
        .attr("data-year", (d) => year);
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
            
      const legendContainer = d3.select("#legend");
      const legend = legendContainer
      .append("svg")
      .attr("width", w2)
      .attr("height", svgHeight);
      
      const legendBarWidth = (w2 - p2 * 2) / (legendTicks.length - 1);
    
    legend.selectAll("rect")
      .data(legendTicks.slice(0, -1))
      .enter()
      .append("rect")
      .attr("x", (d, i) => p2 + i * legendBarWidth) 
      .attr("y", 20)
      .attr("width", legendBarWidth) 
      .attr("height", 40) 
      .attr("fill", (d) => colorScale(d))
      .attr("stroke", "black") 
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);;
    
    const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%Y"));
      
    const yAxis = d3.axisLeft(yScale);
    
    const legendAxis = d3.axisBottom(scaleLegend)
      .tickValues(legendTicks)
      .tickFormat(d => d);
        
    
        svg.append("g")
           .attr("id", "x-axis")
           .attr("transform", "translate(0," + (h - padding) + ")")
           .call(xAxis);
    
        svg.append("g")
           .attr("id", "y-axis")
          .attr("transform", "translate(" + padding  + ",0)")
          .call(yAxis);
       
       legend.append("g")
      .attr("transform", "translate(0," + h2 + ")")
      .call(legendAxis);
    
    }