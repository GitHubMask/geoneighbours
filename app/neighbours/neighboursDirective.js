

app.directive('neighbours', [function(){

  'use strict';

  // --- Sort Neighbours (TODO: add cache)
  function sortNeighbours(current, neighbours) {
    var right_sort = [];
    var left_sort = [];
    for (var i=0;i<neighbours.length;i++) {
        neighbours[i].lng_diff = current.lng - neighbours[i].lng;
        neighbours[i].lat_diff = current.lat - neighbours[i].lat;
        if (neighbours[i].lat_diff >= 0)
          left_sort[_.sortedIndex(left_sort, neighbours[i].lng_diff, 'lng_diff')] = neighbours[i];
        if (neighbours[i].lat_diff < 0)
          right_sort[_.sortedIndex(right_sort, neighbours[i].lng_diff, 'lng_diff')] = neighbours[i];
    }
    return right_sort.concat(left_sort);
  }

  // --- Random color !
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // --- The directive
  return {
    restrict: 'E',
    link: function(scope, element) {
      var width = 700;
      var height = 400;

      var svg = d3.select(element[0])
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      scope.$watch('neighbours', function(newVal, oldVal){
        var current = scope.selectedCountry;
        var sortedNeighbours = sortNeighbours(scope.selectedCountry, scope.neighbours);

        var circles_data = [{
          id: current.geonameId,
          label: current.countryCode,
          cx: width/2,
          cy: height/2,
          radius: 50,
          fill: getRandomColor()
        }];

        var angle = -(Math.PI / 2);
        var step = (2*Math.PI) / sortedNeighbours.length;
        for (var i=0; i<sortedNeighbours.length;i++) {
          circles_data.push({
            id: sortedNeighbours[i].geonameId,
            label: sortedNeighbours[i].countryCode,
            cx: width/2 + 150 * Math.cos(angle),
            cy: height/2 + 150 * Math.sin(angle),
            radius: 40,
            fill: getRandomColor(),
          });
          angle += step;
        }

        console.log(circles_data);

        var circles = svg.selectAll('.country_circle').data(circles_data, function(d) { return d.id; });
        circles.exit().remove();
        circles.enter()
          .append('circle')
          .attr('class', 'country_circle')
          .style('fill', function(d){ return d.fill; })
          .on('click', function(d, i) {
            scope.switchCountry(d.id);
          });

        var circleAttr = circles
          .transition()
          .attr('cx', function(d){ return d.cx; })
          .attr('cy', function(d){ return d.cy; })
          .attr('r', function(d){ return d.radius; });

        var c_names = svg.selectAll('.c_name').data(circles_data, function(d) { return d.id; });
        c_names.exit().remove();
        c_names.enter()
          .append('text')
          .attr('class', 'c_name')
          .text(function(d){ return d.label; })
          .attr("font-family", "sans-serif")
          .attr("font-size", "15px")
          .attr("fill", "black")
          .on('click', function(d, i) {
            scope.switchCountry(d.id);
          });

        var c_namesAttr = c_names
          .transition()
          .attr('x', function(d){ return d.cx - 10; })
          .attr('y', function(d){ return d.cy + 5; });

      });

    }
  };
}]);
