var width = 600,
    height = 540,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 1 * Math.PI]);

var y = d3.scaleLinear()
    .range([0, radius]);

var color = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, 1000]);


var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(1 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(1 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return  Math.max(0, y(d.y0))  ; })
    .outerRadius(function(d) { return  Math.max(0, y(d.y1)) ; });


var svg = d3.select("#sunChart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

d3.json("car_nested.json", function(error, root) {
  if (error) throw error;
  
  root = d3.hierarchy(root);
  root.sum(function(d) { return d.size; });
  svg.selectAll("path")
      .data(partition(root).descendants())
    .enter().append("path")
    .attr("class", function(d) { if(d.depth == 2) return "modelLayer"; })
    .attr("id", function(d) { return d.depth ? null : "internalCircle"; })
      .attr("d", arc)
      //.style("fill", "#4781b3")
      //.style("opacity", .5)
      .style("fill", function(d) { return color((d.children ? d : d.parent).data.size); })
      .on("click", click)
    .append("title")
      .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });

  svg.selectAll(".modelLayer").on("click", function(d) {
  var name = d.data.name.replace(/\s+/g,' ').trim().toUpperCase();
  addCar(name);
});
});

function click(d) {
  svg.transition()
      .duration(300)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}







d3.select(self.frameElement).style("height", height + "px");