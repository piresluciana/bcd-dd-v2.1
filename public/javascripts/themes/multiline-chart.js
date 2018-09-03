class MultiLineChart{

    constructor (//_data, 
        _Element, _titleX, _titleY, _yLabels, _keys){
        // this.data = _data;
        this.element = _Element;
        this.titleX = _titleX;
        this.titleY = _titleY;
        this.yLabels = _yLabels;
        this.keys = _keys;

        this.init();
    }

    // initialise method to draw chart area
    init(){
        let dv = this;

        let elementNode = d3.select(dv.element).node();
        let elementWidth = elementNode.getBoundingClientRect().width; 
        let aspectRatio = elementWidth < 800 ? elementWidth * 0.65 : elementWidth * 0.5;
        
        // margin
        dv.margin = { 
            top: 50, 
            right: 100, 
            bottom: 80, 
            left: 80
        };

        // dimension settings - need to adjust these based on parent size
        // let height = 500 - dv.margin.top - dv.margin.bottom;
        // let width = 900 -dv.margin.left -dv.margin.right;
        
        dv.width = elementWidth - dv.margin.left - dv.margin.right;
        dv.height = aspectRatio - dv.margin.top - dv.margin.bottom;
        
        // add the svg to the target element
        const svg = d3.select(dv.element)
            .append("svg")
            .attr("width", dv.width + dv.margin.left + dv.margin.right)
            .attr("height", dv.height + dv.margin.top + dv.margin.bottom);
       
        // add the g to the svg and transform by top and left margin
        dv.g = svg.append("g")
            .attr("transform", "translate(" + dv.margin.left + 
                ", " + dv.margin.top + ")");
        
        // set transition variable
        dv.t = function() { return d3.transition().duration(1000); };

        // dv.colour = d3.scaleOrdinal(d3.schemeBlues[9]);
        dv.colourScheme = ["#aae0fa","#00929e","#ffc20e","#16c1f3","#da1e4d","#086fb8","#003d68"];

        // set colour function
        dv.colour = d3.scaleOrdinal(dv.colourScheme.reverse());

        // for the tooltip from the d3 book
        dv.bisectDate = d3.bisector(function(d) { return d.date; }).left;

        // set scales
        dv.x = d3.scaleTime()
            .range([0, dv.width]);

        dv.y = d3.scaleLinear()
            .range([dv.height, 0]);

        dv.yAxisCall = d3.axisLeft();

        dv.xAxisCall = d3.axisBottom();

        dv.xAxis = dv.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dv.height +")");
        
        dv.yAxis = dv.g.append("g")
            .attr("class", "y axis");

        // X title
        dv.xLabel = dv.g.append("text")
            .attr("class", "xtitle")
            .attr("x", dv.width/2)
            .attr("y", dv.height + 60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text(dv.titleX);

        // Y title
        dv.yLabel = dv.g.append("text")
            .attr("class", "ytitle")
            .attr("x", - (dv.height/2))
            .attr("y", -60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(dv.titleY);

        // console.log("this is the width at scale function", dv.width);

        dv.addLegend();
        // dv.addSelectForm();
        
        // dv.getData();

    }

    getData(data, valueString){
        let dv = this;
            dv.data = data,
            dv.value = valueString;
            console.log("value string is:", dv.value);
        // btnValue !== undefined ? dv.variable = btnValue : dv.variable = dv.keys[0];
        // console.log(dv.data);        

        // dv.filteredData = (dv.data).find( d => d.name === dv.variable );
        // console.log("filtered data", dv.filteredData);

        // dv.regionData = d3.nest()
        //     .key(function(d){ return d[dv.groupBy];})
        //     .entries(dv.filteredData.values);
        
        // console.log("nested data", dv.regionData);

        dv.update();
    }

    update(){
        let dv = this;

        d3.select(dv.element).select(".focus").remove();
        d3.select(dv.element).select(".focus_overlay").remove();

        // console.log("this should be just the focus in the multiLine chart: ", check);
        // console.log("this should not be here", d3.select(".focus"));
        // d3.select(".focus").remove();
        // d3.select(dv.focus).remove(); // just this objects focus element
        
        // TO DO: Add ToolTip
        // 1. remove all the instances of tooltip lines, circles, text


        // Update scales
        dv.x.domain(d3.extent(dv.data[0].values, function(d) {return (d.date); }));
        
        // for the y domain to track negative numbers 
        const minValue = d3.min(dv.data, function (d) {
            return d3.min(d.values, function (d) { return d[dv.value]; });
        });

        // Set Y axis scales 0 if positive number else use minValue
        dv.y.domain([ minValue >=0 ? 0 : minValue,
          d3.max(dv.data, function (d) { 
            return d3.max(d.values, function (d) { return d[dv.value]; });
          })
        ]);

        // Update axes
        dv.xAxisCall.scale(dv.x); //.ticks(20);
        dv.xAxis.transition(dv.t()).call(dv.xAxisCall);
        dv.yAxisCall.scale(dv.y);
        dv.yAxis.transition(dv.t()).call(dv.yAxisCall);

         // Done: Update x-axis label based on selector
        // dv.xLabel.text(dv.variable);

        // Done: Update y-axis label based on selector
        // var selectorKey = dv.keys.findIndex( d => {  return d === dv.variable; });
        // // console.log("selector key", selectorKey);
        // var newYLabel = dv.yLabels[selectorKey];
        
        // dv.yLabel.text(newYLabel);

         // d3 line function
        dv.line = d3.line()
            .x(function(d) {
                return dv.x(d.date); 
            })
            .y(function(d) { //this works
                return dv.y(d[dv.value]); 
            });
            // .curve(d3.curveBasis);

        // Adapted from the tooltip based on the example in the d3 Book
        
        // 2. add the on mouseover and on mouseout to the joined data

        // select all regions and join data
        dv.regions = dv.g.selectAll(".regions")
            .data(dv.data);
        
        // update the paths
        dv.regions.select(".line")
            .transition(dv.t)
            .attr("d", function (d) { return dv.line(d.values); });
            // .attr("d", function(d) { 
            //     return d.active ? dv.line(d.values) : null; });
        
        // Enter elements
        dv.regions.enter().append("g")
            .attr("class", "regions")
            .append("path")
            .attr("class", "line")
            .attr("id", d => d.key)
            .attr("lineId", d => d.key)
            .attr("d", d => { return dv.line(d.values); })
            // .attr("d", function(d) { 
            //     return d.active ? dv.line(d.values) : null; })
            .style("stroke", d => { return dv.colour(d.key); })
            .style("stroke-width", "2px")
            .style("fill", "none");  
        
        // dv.regions.transition(dv.t)
        //     .attr("d", function (d) { return dv.line(d.values); });
            
        dv.regions.exit()
            .transition(dv.t).remove();

        // add group to contain all the focus elements
        let focus = dv.g.append("g")
            .attr("class", "focus")
            .style("display", "none");
        
        // Year label
        focus.append("text")
            .attr("class", "focus_quarter")
            .attr("x", 9)
            .attr("y", 7);
        
        // Focus line
        focus.append("line")
            .attr("class", "focus_line")
            .attr("y1", 0)
            .attr("y2", dv.height);
        
        // attach group append circle and text for each region
        dv.keys.forEach( (d,i) => {
            console.log("the values of each key", i);
            let tooltip = focus.append("g")
                .attr("class", "tooltip_" + i);

            tooltip.append("circle")
                .attr("r", 0)
                .transition(dv.t)
                .attr("r", 5)
                .attr("fill", "white")
                .attr("stroke", dv.colour(d));

            tooltip.append("text")
                .attr("x", 9)
                .attr("dy", ".35em");

        });

        // append a rectangle overlay to capture the mouse
        dv.g.append("rect")
            .attr("class", "focus_overlay")
            .attr("width", dv.width + 10) // give a little extra for last value
            .attr("height", dv.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .style("visibility", "hidden")
            .on("mouseover", () => { focus.style("display", null); })
            .on("mouseout", () => { focus.style("display", "none"); })
            .on("mousemove", mousemove);

            // console.log("this is the width at the focus overlay", dv.width);

        function mousemove(){
            focus.style("visibility","visible")
            let mouse = d3.mouse(this);

            dv.data.forEach((reg, idx) => {
                
                console.log("what are reg values:", idx);


                // this is from the d3 book
                let x0 = dv.x.invert(mouse[0]),
                i = dv.bisectDate(reg.values, x0, 1),
                d0 = reg.values[i - 1],
                d1 = reg.values[i],
                d;  

                console.log("x0 is", x0);
                console.log("should return a number", i);

                d1 !== undefined ? d = x0 - d0.date > d1.date - x0 ? d1 : d0 : false;
                
                let id = ".tooltip_" + idx;
                // console.log("tool tip to select #",id);

                let tooltip = d3.select(dv.element).select(id); 
                
                if(d !== undefined){
                    tooltip.attr("transform", "translate(" + dv.x(d.date) + "," + dv.y(d[dv.value]) + ")");

                    tooltip.select("text").text(d[dv.value]);
                    focus.select(".focus_line").attr("transform", "translate(" + dv.x(d.date) + ", 0)");
                }
            });
        }
    }

    addLegend(){
        let dv = this;

        // create legend group
        var legend = dv.g.append("g")
            .attr("transform", "translate(" + (0) + 
                        ", " + (0) + ")"); // if the legend needs to be moved

        // create legend array, this needs to come from the data.
        
        let legendArray = []
        
        dv.keys.forEach( (d,i) => {

            let obj = {};
                obj.label = d;
                obj.colour = dv.colour(d);
                legendArray.push(obj);
        });

        // data.forEach(d => {
        //     for (var key in d) {
        //         // console.log(key);
        //         var obj = {};
        //         if (!(key === "type" || key === "region")){
        //         obj.type = d.type;
        //         obj.region = d.region;
        //         obj.year = key;
        //         obj.value = +d[key];
        //         legendArray.push(obj);
        //     }}
        // });

        // var legendArray = dv.regionData;
        // console.log(legendArray);

        // get data and enter onto the legend group
        var legend = legend.selectAll(".legend")
            .data(legendArray)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; })
            .style("font", "12px sans-serif");

        // // get data and enter onto the legend group
        // legend = legend.selectAll(".legend")
        //     .data(dv.regionData)
        //     .enter().append("g")
        //     .attr("class", "legend")
        //     .attr("transform", function(d, i) { return "translate(0," + i * 40 + ")"; })
        //     .style("font", "12px sans-serif");
        
        // console.log("width at the legend draw", dv.width);
        // add legend boxes    
        legend.append("rect")
            .attr("class", "legendRect")
            .attr("x", dv.width + 25)
            .attr("width", 25)
            .attr("height", 25)
            .attr("fill", d => { return d.colour; })
            .attr("fill-opacity", 0.75);

        legend.append("text")
            .attr("class", "legendText")
            .attr("x", dv.width + 60)
            .attr("y", 12)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(d => { return d.label; }); 
    }


            // // taking from the d3 book
            // .on("click", d => {
            //     console.log(d);
            //     var active   = d.active ? false : true,
            //     newOpacity = active ? 1 : 0; 
            //     console.log("active", active);
            //     console.log("opactiy", newOpacity);
            //     // Hide or show the elements based on the ID
            //     d3.select("#"+d.label)
            //         .transition().duration(100) 
            //         .style("opacity", newOpacity); 
            //     d3.select(dv.element).select(".tooltip_"+d.label)
            //         .transition().duration(100) 
            //         .style("opacity", newOpacity);

            //     // Update whether or not the elements are active
            //     d.active = active;
            //     });

        // add legend text
    
    // addSelectForm(){
    //     var dv = this

    //     dv.list = d3.select("#seriesMenu1")
    //         .append("select")
    //         .attr("class","form-control");

    //     dv.list.selectAll("option")
    //     // add the data and join
    //         .data(keys)
    //         .enter()
    //     // append option with type name as value and text
    //         .append("option")
    //         .attr("value", d => d)
    //         .text( d => d );
        
    //     dv.list.on("change", function(){
    //         mlineChart.getData();
    //     });
    // }

}