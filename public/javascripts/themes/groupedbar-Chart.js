class GroupedBarChart{

    // constructor function
    constructor (_data, _keys, _xValue, _element, _titleX, _titleY){

        this.d = _data;
        this.keys = _keys;
        this.xV = _xValue;
        this.e = _element;
        this.titleX = _titleX; // grouped bar c
        this.titleY = _titleY; // millions

        // create the c area
        this.init();
    }

    // initialise method to draw c area
    init(){
        let c = this,
            elementNode = d3.select(c.e).node(),
            elementWidth = elementNode.getBoundingClientRect().width,
            aspectRatio = elementWidth < 800 ? elementWidth * 0.65 : elementWidth * 0.5;

        const breakPoint = 678;
        
        // margin
        c.m = { };

        c.m.t = elementWidth < breakPoint ? 40 : 50;
        c.m.b = elementWidth < breakPoint ? 30 : 80;

        c.m.right = elementWidth < breakPoint ? 20 : 120;
        c.m.left = elementWidth < breakPoint ? 20 : 80;
        
        c.w = elementWidth - c.m.left - c.m.right;
        c.height = aspectRatio - c.m.t - c.m.b;

        c.initTooltip();

        // add the svg to the target element
        c.svg = d3.select(c.e)
            .append("svg")
            .attr("width", c.w + c.m.left + c.m.right)
            .attr("height", c.height + c.m.t + c.m.b);
       
        // add the g to the svg and transform by top and left margin
        c.g = c.svg.append("g")
            .attr("transform", "translate(" + c.m.left + 
                ", " + c.m.t + ")");
    
        // transition 
        // c.t = () => { return d3.transition().duration(1000); }
    
        // c.colourScheme = ["#aae0fa","#00929e","#da1e4d","#ffc20e","#16c1f3","#086fb8","#003d68"];
        c.colourScheme =d3.schemeBlues[9].slice(3);

        // set colour function
        c.colour = d3.scaleOrdinal(c.colourScheme);

        c.x0 = d3.scaleBand()
            .range([0, c.w])
            .padding(0.2);

        c.x1 = d3.scaleBand()
            .paddingInner(0.1);
    
        c.y = d3.scaleLinear()
            .range([c.height, 0]);

        c.yAxisCall = d3.axisLeft();

        c.xAxisCall = d3.axisBottom()
            .tickFormat(d => {return d});

        c.gridLines = c.g.append("g")
            .attr("class", "grid-lines");

        c.xAxis = c.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + c.height +")");
        
        c.yAxis = c.g.append("g")
            .attr("class", "y-axis");
    
        // X title
        c.g.append("text")
            .attr("class", "titleX")
            .attr("x", c.w/2)
            .attr("y", c.height + 60)
            .attr("text-anchor", "middle")
            .text(c.titleX);
    
        // Y title
        c.g.append("text")
            .attr("class", "titleY")
            .attr("x", - (c.height/2))
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(c.titleY);

        c.update();
    
    }

    getData(){
        let c = this;
    
    }
    
    update(){
        let c = this;

        // Update scales
        c.x0.domain(c.d.map(d => {return d[c.xV]; }));
        c.x1.domain(c.keys).range([0, c.x0.bandwidth()]);
        c.y.domain([0, d3.max(c.d, d => { return d3.max(c.keys, key => { return d[key]; }); })]).nice();

        // Update axes
        c.xAxisCall.scale(c.x0);
        c.xAxis.call(c.xAxisCall)
        .selectAll(".tick text").call(c.textWrap, 60, 0);
        
        c.scaleFormatY ? c.yAxisCall.scale(c.y).tickFormat(c.scaleFormatY) : c.yAxisCall.scale(c.y);
        c.yAxisCall.scale(c.y);
        c.yAxis.call(c.yAxisCall);

        c.drawGridLines();

        c.g.selectAll(".layers").remove();
        c.g.selectAll(".focus_overlay").remove();

        c.group = c.g.selectAll(".layers")
            .data(c.d);

        c.rectGroup = c.group.enter()
            .append("g")
            .attr("class","layers")
            .attr("transform", (d) => { return "translate(" + c.x0(d[c.xV]) + ",0)"; })
            
        c.rects = c.rectGroup.selectAll("rect")
                .data(d => { 
                    return c.keys.map( key => { 
                    return {
                        key: key, 
                        value: d[key],
                        date: d[c.xV]
                    }; 
                }); 
            });//hmmm this needs to change?
            // could this be done differently.

        c.rect = c.rects.enter().append("rect")
            .attr("x", d => {return c.x1(d.key);})
            .attr("y", d => {return c.y(d.value);})
            .attr("width", c.x1.bandwidth())
            .attr("height", d => { return (c.height - c.y(d.value)); })
            .attr("fill", d => { return c.colour(d.key); })
            .attr("fill-opacity", ".75");

        
        c.rectsOverlay = c.g.selectAll(".focus_overlay")
            .data(c.d)
            .enter();

        // // append a rectangle overlay to capture the mouse
        c.rectsOverlay.append("g")
            .attr("class", "focus_overlay")
            .append("rect")
            .attr("x", d => c.x0(d[c.xV]))
            .attr("y", "0")
            .attr("width", c.x0.bandwidth()) // give a little extra for last value
            .attr("height", c.height)
            .style("fill", "none")
            .style("stroke","#00bff7")
            .style("pointer-events", "all")
            .style("visibility", "hidden")
            .on("mouseover", function(){
                d3.select(this).style("visibility", "visible");
                c.newToolTip.style("visibility","visible");
            })
            .on("mouseout", function(){ 
                d3.select(this).style("visibility", "hidden");
                c.newToolTip.style("visibility","hidden");
            })
            .on("mousemove", (d, e, a)=> c.mousemove(d, e, a));

        c.addLegend();
    }

    drawGridLines(){
        let c = this;

        c.gridLines.selectAll("line")
            .remove();

        c.gridLines.selectAll("line.horizontal-line")
            .data(c.y.ticks)
            .enter()
                .append("line")
                .attr("class", "horizontal-line")
                .attr("x1", (0))
                .attr("x2", c.w)
                .attr("y1", (d) => {return c.y(d)})
                .attr("y2", (d) => c.y(d));
    }

    addLegend(){
        let c = this;

        let legend = c.g.append("g")
            .attr("transform", "translate(0,0)");

        let legendArray = [];

        c.keys.forEach((d,i) =>{
            let obj = {};
                obj.label = d;
                obj.colour = c.colour(d);
                legendArray.push(obj);
        });
        
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
                .attr("x", c.w + 2)
                .attr("fill", d => { return d.colour; })
                .attr("fill-opacity", 0.75);

            legends.append("text")
                .attr("class", "legendText")
                .attr("y", 12)
                .attr("dy", "0em")
                .attr("text-anchor", "start")
                .text(d => { return d.label; })
                .call(c.textWrap, 100, c.w + 22); 
    }

    initTooltip(){
        let c = this,
            keys = c.keys,
            div,
            p,
            divHeaders,
            pHeader;

            c.newToolTip = d3.select(c.e)
                .append("div")
                .attr("class","tool-tip bcd")
                .style("visibility","hidden");

            c.newToolTipTitle = c.newToolTip
                .append("div")
                .attr("id", "bcd-tt-title");

            divHeaders = c.newToolTip
                .append("div")
                .attr("class", "headers");

            divHeaders
                .append("span")
                .attr("class", "bcd-rect");

            pHeader = divHeaders
                .append("p")
                .attr("class","bcd-text");

            pHeader
                .append("span")
                .attr("class","bcd-text-title")
                .text("Type");

            pHeader
                .append("span")
                .attr("class","bcd-text-value")
                .text("Value");

            pHeader
                .append("span")
                .attr("class","bcd-text-rate")
                .text("% Rate");

            pHeader
                .append("span")
                .attr("class","bcd-text-indicator");

            keys.forEach( (d, i) => {
                div = c.newToolTip
                        .append("div")
                        .attr("id", "bcd-tt" + i);
                    
                div.append("span").attr("class", "bcd-rect");

                p = div.append("p").attr("class","bcd-text");

                p.append("span").attr("class","bcd-text-title");
                p.append("span").attr("class","bcd-text-value");
                p.append("span").attr("class","bcd-text-rate");
                p.append("span").attr("class","bcd-text-indicator");
            });
    }

    addTooltip(title, format, date, prefix, postfix){

        let c = this;
            c.datelabel = date;

            c.title = title;
            c.valueFormat = format;
            c.ttWidth = 305,
            c.ttHeight = 50,
            c.ttBorderRadius = 3;
            c.formatYear = d3.timeFormat("%Y");
            c.prefix = prefix ? prefix : " ";
            c.postfix = postfix ? postfix: " ";
            c.valueFormat = c.formatValue(c.valueFormat);
            c.hV = 0;

    }

    mousemove(d, e, a){
        let c = this,
            rects = a[e],
            x = c.x0(d[c.xV]), 
            y = 50,
            ttTextHeights = 0,
            tooltipX = c.getTooltipPosition(x),
            data = a[e].__data__,
            prevData = a[e-1] ? a[e-1].__data__ : null,
            key = c.keys;

            c.newToolTip.style("left", tooltipX + "px").style("top", "20px");

            key.forEach( (v,idx) => {
                let id = "#bcd-tt" + idx,
                    div = c.newToolTip.select(id),
                    p = div.select(".bcd-text"),
                    newD = data[key[idx]],
                    oldD = prevData ? prevData[key[idx]] : null,
                    diff = prevData ? (newD -  oldD)/oldD: 0, 
                    indicator = diff > 0 ? " ▲" : diff < 0 ? " ▼" : "",
                    indicatorColour = diff > 0 ? "#20c997" : diff < 0 ? "#da1e4d" : "#f8f8f8",
                    rate = indicator !== "" ? d3.format(".1%")(diff) : "",
                    vString = c.valueFormat !=="undefined"? c.valueFormat(data[key[idx]]) : data[key[idx]];

                    c.newToolTipTitle.text(c.title + " " + (d[c.xV])); //label needs to be passed to this function 

                    div.select(".bcd-rect").style("background-color", c.colour(v));
                    p.select(".bcd-text-title").text(v);
                    p.select(".bcd-text-value").text(vString);
                    p.select(".bcd-text-rate").text((rate));
                    p.select(".bcd-text-indicator").text(" " + indicator).style("color", indicatorColour);

                // let tooltipBody = c.svg.select(tpId),
                //     textHeight = tooltipBody.node().getBBox().height ? tooltipBody.node().getBBox().height : 0;

                //     tooltipBody.attr("transform", "translate(5," + ttTextHeights +")");
                //     tooltipBody.select(".tp-text-right").text(vString);
                //     tooltipBody.select(".tp-text-indicator").text(diffPer +" "+iSymbol).attr("fill",iColour);
                //     ttTextHeights += textHeight + 6;
            });
    }

    // drawTooltip(){
    //     let c = this,
    //         tooltipTextContainer = c.svg.select(".tooltip-group")
    //         .append("g")
    //             .attr("class","tooltip-text")
    //             .attr("fill","#f8f8f8"),

    //         tooltip = tooltipTextContainer
    //         .append("rect")
    //             .attr("class", "tooltip-container")
    //             .attr("width", c.ttWidth)
    //             .attr("height", c.ttHeight)
    //             .attr("rx", c.ttBorderRadius)
    //             .attr("ry", c.ttBorderRadius)
    //             .attr("fill","#001f35e6")
    //             .attr("stroke", "#6c757d")
    //             .attr("stroke-width", 2),
            
    //         tooltipTitle = tooltipTextContainer
    //         .append("text")
    //             .text("test tooltip")
    //             .attr("class", "tooltip-title")
    //             .attr("x", 5)
    //             .attr("y", 16)
    //             .attr("dy", ".35em")
    //             .style("fill", "#a5a5a5"),

    //         tooltipDivider = tooltipTextContainer
    //             .append("line")
    //                 .attr("class", "tooltip-divider")
    //                 .attr("x1", 0)
    //                 .attr("x2", c.ttWidth)
    //                 .attr("y1", 31)
    //                 .attr("y2", 31)
    //                 .style("stroke", "#6c757d"),

    //         tooltipBody = tooltipTextContainer
    //             .append("g")
    //                 .attr("class","tooltip-body")
    //                 .attr("transform", "translate(5,50)");
    // }

    // updateTooltip(d,i){
    //     let c = this;

    //     let tooltipBodyItem = c.svg.select(".tooltip-body")
    //         .append("g")
    //         .attr("class", "tooltipbody_" + i);

    //     tooltipBodyItem.append("text")
    //         .text(d)
    //         .attr("class", "tp-text-left")
    //         .attr("x", "12")
    //         .attr("dy", ".35em")
    //         .call(c.textWrap, 140, 12);

    //     tooltipBodyItem.append("text")
    //         .attr("class", "tp-text-right")
    //         .attr("x", "10")
    //         .attr("dy", ".35em")
    //         .attr("dx", c.ttWidth - 90)
    //         .attr("text-anchor","end");

    //     tooltipBodyItem.append("text")
    //         .attr("class", "tp-text-indicator")
    //         .attr("x", "10")
    //         .attr("dy", ".35em")
    //         .attr("dx", c.ttWidth - 25)
    //         .attr("text-anchor","end");


    //     tooltipBodyItem.append("rect")
    //         .attr("class", "label-rect")
    //         .attr("width", 10)
    //         .attr("height", 10)
    //         .attr("y", -5)
    //         .attr("x", -3)
    //         .attr("fill", c.colour(d))
    //         .attr("fill-opacity", 0.75);

    //     c.updateSize();
    // }

    // updatePosition(xPosition, yPosition){
    //     let c = this;
    //     // get the x and y values - y is static
    //     let [tooltipX, tooltipY] = c.getTooltipPosition([xPosition, yPosition]);
    //     console.log("x pos", tooltipX)
    //     c.g.select(".bcd-tooltip").attr("transform", "translate(" + tooltipX + ", " + tooltipY +")");
    // }

    // updateSize(){
    //     let c = this;
    //     let height = c.svg.select(".tooltip-body").node().getBBox().height;
    //         c.ttHeight += height + 5;
    //         c.svg.select(".tooltip-container").attr("height", c.ttHeight);
    // }

    getTooltipPosition(mouseX) {
        let c = this,
            ttX,
            cW,
            offset;

            cW = c.w  - c.ttWidth;
            offset = c.x1.bandwidth() < 20 ? c.x1.bandwidth() : 15;

            // show right
            if (mouseX < cW) {
                ttX = mouseX + c.x0.bandwidth() + offset + c.m.left;
                
            } else {
                // show left minus the size of tooltip + 10 padding
                ttX = mouseX + c.m.left + offset - c.ttWidth;
            }
            return ttX;
    }

    formatValue(format){
        // formats thousands, Millions, Euros and Percentage
        switch (format){
            case "millions":
                return d3.format(".2s");
                break;
        
            case "euros":
                return "undefined";
                break;
        
            case "thousands":
                return d3.format(",");
                break;
        
            case "percentage":
                return d3.format(".2%");
                break;
        
            default:
                return "undefined";
        }
    }

    hideRate(value){
        let c = this;
        value ? c.svg.selectAll(".tp-text-indicator").style("display", "none") : c.svg.selectAll(".tp-text-indicator").style("display", "block")
    }

    textWrap(text, width, xpos = 0, limit=3) {
        text.each(function() {
            let words,
                word,
                line,
                lineNumber,
                lineHeight,
                y,
                dy,
                tspan;

            text = d3.select(this);

            words = text.text().split(/\s+/).reverse();
            line = [];
            lineNumber = 0;
            lineHeight = 1;
            y = text.attr("y");
            dy = parseFloat(text.attr("dy"));
            tspan = text
                .text(null)
                .append("tspan")
                .attr("x", xpos)
                .attr("y", y)
                .attr("dy", dy + "em");

            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(" "));

                if (tspan.node() && tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));

                    if (lineNumber < limit - 1) {
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", xpos)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                        // if we need two lines for the text, move them both up to center them
                        text.classed("adjust-upwards", true);
                    } else {
                        line.push("...");
                        tspan.text(line.join(" "));
                        break;
                    }
                }
            }
        });
    }
    
}