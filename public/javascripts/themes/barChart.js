class BarChart{

// constructor function
    constructor (_data, _element, _variableRegion, _variableType, _titleX, _titleY){
        // load in arguments from config object
        this.data = _data;
        this.element = _element;
        this.variableRegion = _variableRegion;
        this.variableType = _variableType;
        this.titleX = _titleX;
        this.titleY = _titleY;
        
        // create the chart area
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

        dv.tooltip = d3.select(dv.element)
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
        dv.t = () => { return d3.transition().duration(1000); }

        dv.colourScheme = ["#aae0fa","#00929e","#ffc20e","#16c1f3","#da1e4d","#086fb8","#003d68"];

        // set colour function
        dv.colour = d3.scaleOrdinal(dv.colourScheme.reverse());

        dv.x = d3.scaleBand()
            .range([0, dv.width])
            .padding(0.2);

        dv.y = d3.scaleLinear()
            .range([dv.height, 0]);

        dv.yAxisCall = d3.axisLeft();

        dv.xAxisCall = d3.axisBottom()
            .tickFormat(d => {return d});

        dv.xAxis = dv.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dv.height +")");
        
        dv.yAxis = dv.g.append("g")
            .attr("class", "y axis");

        // X title
        dv.g.append("text")
            .attr("class", "title")
            .attr("x", dv.width/2)
            .attr("y", dv.height + 60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text(dv.titleX);

        // Y title
        dv.g.append("text")
            .attr("x", - (dv.height/2))
            .attr("y", -60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(dv.titleY);

        dv.getData();

    }

    getData(){
        var dv = this;

        dv.dataFiltered = dv.data.find( 
            d => d.key === dv.variableRegion)
            .values.find(
                d => d.key === dv.variableType
            ).values;

        dv.update();
    };

    update(){
        var dv = this;

        // Update scales
        dv.x.domain(dv.dataFiltered.map((d)=>{ return d.year; }));
        dv.y.domain([0, d3.max(dv.dataFiltered, (d) => { return +d.value; })]);

        // Update axes
        dv.xAxisCall.scale(dv.x);
        dv.xAxis.transition(dv.t()).call(dv.xAxisCall);
        
        dv.yAxisCall.scale(dv.y);
        dv.yAxis.transition(dv.t()).call(dv.yAxisCall);

        // join new data with old elements.
        dv.rects = dv.g.selectAll("rect").data(dv.dataFiltered, function(d){
            return d.year;
        });

        // exit old elements not present in new data.
        dv.rects.exit()
            .attr("class", "exit")
            .transition(dv.t())
            .attr("height", 0)
            .attr("y", dv.height)
            .style("fill-opacity", "0.1")
            .remove();

        // update old elements present in new data.
        dv.rects.attr("class", "update")
            .transition(dv.t())
                .attr("y", function(d){ return dv.y(d.value); })
                .attr("height", function(d){ return (dv.height - dv.y(d.value)); })
                .attr("x", function(d){ return dv.x(d.year) })
                .attr("width", dv.x.bandwidth)

        // enter new elements present in new data.
        dv.rects
            .enter()
            .append("rect")
            .attr("class", "enter")
            .attr("fill", dv.colour)
            .attr("fill-opacity", ".75")
            .attr("height", 0)
            .attr("x", function(d){ return dv.x(d.year); })
            .attr("width", dv.x.bandwidth)
            .attr("y", dv.height)
            .transition(dv.t())
            .attr("y", function(d){ return dv.y(d.value); })
            .attr("height", function(d){ return (dv.height - dv.y(d.value)); })
            .style("stroke", dv.colour)
            .style("stroke-width", "1");
        
        dv.g.selectAll("rect")
            .on("mouseover", function(){ 
                dv.tooltip.style("display", null); 
            })
            .on("mouseout", function(){ 
                dv.tooltip.style("display", "none"); 
            })
            .on("mouseover", function(d){
                var dx  = parseFloat(d3.select(this).attr('x')) + dv.x.bandwidth(), 
                    dy  = parseFloat(d3.select(this).attr('y')) + 10;
                dv.tooltip
                    .style( 'left', dx + "px" )
                    .style( 'top', dy + "px" )
                    .style( 'display', 'block' )
                    .text("The value is: €" + (d.value));
            });
    }

}