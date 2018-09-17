class GroupedBarChart{

    // constructor function
    constructor (_data, _keys, _xValue, _element, _titleX, _titleY){

        this.data = _data;
        this.keys = _keys;
        this.xValue = _xValue;
        this.element = _element;
        this.titleX = _titleX; // grouped bar chart
        this.titleY = _titleY; // millions

        // create the chart area
        this.init();
    }

    // initialise method to draw chart area
    init(){
        let dv = this; 

        let elementNode = d3.select(dv.element).node();
        let elementWidth = elementNode.getBoundingClientRect().width; 
        let aspectRatio = elementWidth < 800 ? elementWidth * 0.65 : elementWidth * 0.5;

        const breakPoint = 678;
        
        // margin
        dv.margin = { 
            top: 50,
            bottom: 80
        };

        dv.margin.right = elementWidth < breakPoint ? 0 : 150;
        dv.margin.left = elementWidth < breakPoint ? 0 : 80;

        console.log(dv.margin);
        
        dv.width = elementWidth - dv.margin.left - dv.margin.right;
        dv.height = aspectRatio - dv.margin.top - dv.margin.bottom;

        dv.tooltip = d3.select(".page__root")
            .append('div')  
            .attr('class', 'tool-tip');  

        // add the svg to the target element
        const svg = d3.select(dv.element)
            .append("svg")
            .attr("width", dv.width + dv.margin.left + dv.margin.right)
            .attr("height", dv.height + dv.margin.top + dv.margin.bottom);
       
        // add the g to the svg and transform by top and left margin
        dv.g = svg.append("g")
            .attr("transform", "translate(" + dv.margin.left + 
                ", " + dv.margin.top + ")");
    
        // transition 
        // dv.t = () => { return d3.transition().duration(1000); }
    
        dv.colourScheme = ["#aae0fa","#00929e","#da1e4d","#ffc20e","#16c1f3","#086fb8","#003d68"];

        // set colour function
        dv.colour = d3.scaleOrdinal(dv.colourScheme.reverse());

        dv.x0 = d3.scaleBand()
            .range([0, dv.width])
            .padding(0.2);

        dv.x1 = d3.scaleBand()
            .paddingInner(0.1);
    
        dv.y = d3.scaleLinear()
            .range([dv.height, 0]);

        dv.yAxisCall = d3.axisLeft();

        dv.xAxisCall = d3.axisBottom()
            .tickFormat(d => {return d});

        dv.xAxis = dv.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + dv.height +")");
        
        dv.yAxis = dv.g.append("g")
            .attr("class", "y-axis");
    
        // X title
        dv.g.append("text")
            .attr("class", "titleX")
            .attr("x", dv.width/2)
            .attr("y", dv.height + 60)
            .attr("text-anchor", "middle")
            .text(dv.titleX);
    
        // Y title
        dv.g.append("text")
            .attr("class", "titleY")
            .attr("x", - (dv.height/2))
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(dv.titleY);
    
        dv.update();
    
    }
    
    update(){
        let dv = this;

        // Update scales
        console.log("grouped bar chart data", dv.data);
        dv.x0.domain(dv.data.map(d => { return d[dv.xValue]; }));
        dv.x1.domain(dv.keys).range([0, dv.x0.bandwidth()]);
        dv.y.domain([0, d3.max(dv.data, d => { return d3.max(dv.keys, key => { return d[key]; }); })]).nice();

        // Update axes
        dv.xAxisCall.scale(dv.x0);
        dv.xAxis.call(dv.xAxisCall);
        
        dv.yAxisCall.scale(dv.y);
        dv.yAxis.call(dv.yAxisCall);

        // // join new data with old elements.
        // dv.rects = dv.g.selectAll("g")
        //     .data(dv.data);

        // exit old elements not present in new data.
        // dv.rects.exit()
        //     .attr("class", "exit")
        //     // .transition(dv.t())
        //     .attr("height", 0)
        //     .attr("y", dv.height)
        //     .style("fill-opacity", "0.1")
        //     .remove();

        // update old elements present in new data.
        // dv.rects.attr("class", "update")
        //     // .transition(dv.t())
        //         .attr("y", function(d){ return dv.y(d.value); }) // what value here
        //         .attr("height", function(d){ return (dv.height - dv.y(d.value)); }) //what value here
        //         .attr("x", function(d){ return dv.x1(d[dv.xValue]); }) // should this be passed as an opition?
        //         .attr("width", dv.x1.bandwidth);

        // enter new elements present in new data.

        // join new data with old elements.
        dv.rects = dv.g.append("g")
            .selectAll("g")
            .data(dv.data)
            .enter()
            .append("g")
            .attr("transform", (d) => { return "translate(" + dv.x0(d[dv.xValue]) + ",0)"; })
            .selectAll("rect")
            .data(d => { return dv.keys.map( key => { 
                    return {
                        key: key, 
                        value: d[key]
                     }; 
                }); 
            })
            .enter().append("rect")
            .attr("x", d => { return dv.x1(d.key); })
            .attr("y", d => { return dv.y(d.value); })
            .attr("width", dv.x1.bandwidth())
            .attr("height", d => { return (dv.height - dv.y(d.value)); })
            .attr("fill", d => { return dv.colour(d.key); })
            .attr("fill-opacity", ".75");
        
        dv.g.selectAll("rect")
            .on("mouseover", function(){ 
                dv.tooltip.style("display", "inline-block"); 
            })
            .on("mouseout", function(){ 
                dv.tooltip.style("display", "none"); 
            })
            .on("mousemove", function(d){
                let dx  = parseFloat(d3.select(this).attr('x')) + dv.x0.bandwidth() + 100, 
                    dy  = parseFloat(d3.select(this).attr('y')) + 10;
                let x = d3.event.pageX, 
                    y = d3.event.clientY,
                    fill = d3.select(this).style("fill");

                dv.tooltip
                    .style( 'left', (d3.event.pageX+10) + "px" )
                    .style( 'top', (d3.event.pageY) + "px" )
                    .style( 'display', "inline-block" )
                    .text("The value is: " + (d.value)); // what should the value be ?
                
                dv.tooltip.append("div")
                    .attr("class", "tip-box")
                    .style("background", fill)
                    .style("opacity", 0.75)
                    .style("width", "18px")
                    .style("height", "18px")
                    .style("margin-right", "5px")
                    .style("float", "left");
            });

        dv.addLegend();
    }

    addLegend(){
        let dv = this;

        let legend = dv.g.append("g")
            .attr("transform", "translate(0,0)");

        let legendArray = [];

        dv.keys.forEach((d,i) =>{
            let obj = {};
                obj.label = d;
                obj.colour = dv.colour(d);
                legendArray.push(obj);
        });

        console.log("the grouped charts legend array", legendArray);
        
        let legends = legend.selectAll(".legend")
                .data(legendArray)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", (d, i)=> {
                    return "translate(0," + i * 40 + ")"; 
                });

            legends.append("rect")
                .attr("class", "legendRect")
                .attr("x", dv.width + 5)
                .attr("fill", d => { return d.colour; })
                .attr("fill-opacity", 0.75);

            legends.append("text")
                .attr("class", "legendText")
                .attr("x", dv.width + 30)
                .attr("y", 12)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .text(d => { return d.label; }); 
    }
    
}

let tooltipOffset = {
    y: -55,
    x: 0
}

function getTooltipPosition([mouseX, mouseY]){
    let tooltipX, tooltipY;

    // show tooltip to the right
    if ((mouseX - 250) < 0) {
        // Tooltip on the right
        tooltipX = 250 - 185;
    } else {
        // Tooltip on the left
        tooltipX = -205
    }

    if (mouseY) {
        tooltipY = tooltipOffset.y;
        // tooltipY = mouseY + tooltipOffset.y;
    } else {
        tooltipY = tooltipOffset.y;
    }

    return [tooltipX, tooltipY];
}

console.log("mouse position test", getTooltipPosition([300, 300]));