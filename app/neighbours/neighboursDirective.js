

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

  // --- Add circle data to existing object
  function addCircleData(src, cx, cy, radius) {
    var data = _.clone(src);
    _.assign(data, {
      cx: cx,
      cy: cy,
      radius: radius,
    });
    return data;
  }

  // --- Do my circle intersect ?
  function theyIntersect(c1, c2) {
    var radi_sum = c1.radius + c2.radius;
    var dist = Math.sqrt(Math.pow(c1.cx - c2.cx,2) + Math.pow(c1.cy - c2.cy,2));
    return radi_sum >= dist;
  }

  // --- The directive
  return {
    restrict: 'E',
    link: function(scope, element) {
      var width = 600;
      var height = 400;
      var radius = 45;

      var svg = d3.select(element[0])
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      scope.$watch('neighbours', function(newVal, oldVal){
        var current = scope.selectedCountry;
        var sortedNeighbours = sortNeighbours(scope.selectedCountry, newVal);

        // --- The circles
        var circles_data = [];

        // --- The current one
        circles_data.push(addCircleData(current, width/2, height/2, radius));

        // --- The neighbours
        var angle = -(Math.PI/2);
        var step = (2*Math.PI) / sortedNeighbours.length;
        for (var i=0; i<sortedNeighbours.length;i++) {
          var range = 110;
          var c = {
            cx: width/2 + range * Math.cos(angle),
            cy: height/2 + range * Math.sin(angle),
            radius: current.population > sortedNeighbours[i].population ? radius - 15 : radius + 15,
          };

          // All but the first : check if it collides with the previous one
          if (i !== 0) {
            var previous = circles_data[i];
            while (theyIntersect(c, previous)) {
              c.cx = width/2 + range * Math.cos(angle);
              c.cy = height/2 + range * Math.sin(angle);
              range += range/4;
            }
          }

          // Last one must not collide with the first one
         if (i === (sortedNeighbours.length - 1)) {
            var next = circles_data[1];
            while (theyIntersect(c, next)) {
              c.cx = width/2 + range * Math.cos(angle);
              c.cy = height/2 + range * Math.sin(angle);
              range += range/2;
            }
          }

          circles_data.push(addCircleData(sortedNeighbours[i], c.cx, c.cy, c.radius));
          angle += step;
        }

        var circles = svg.selectAll('.country_circle').data(circles_data, function(d) { return d.geonameId; });
        circles.exit().remove();
        circles.enter()
          .append('circle')
          .attr('class', 'country_circle')
          .attr('style', 'cursor:pointer;')
          .style('fill-opacity', '0.6')
          .on('click', function(d, i) {
            scope.switchCountry(d.geonameId);
          });

        circles
          .style('fill', function(d, i) {
            if (i === 0)
              return 'green';
            return 'orange';
          })
          .transition()
          .attr('cx', function(d){ return d.cx; })
          .attr('cy', function(d){ return d.cy; })
          .attr('r', function(d){ return d.radius; });

        var flags = svg.selectAll('.flag').data(circles_data, function(d) { return d.geonameId; });

        flags.exit().remove();
        flags.enter()
          .append('svg:image')
          .attr('class', 'flag')
          .attr('width', 32)
          .attr('height', 32)
          .attr('xlink:href', function(d) {
            return 'assets/flags/' + d.countryCode + '.png';
          })
          .attr('style', 'cursor:pointer;')
          .on('click', function(d, i) {
            scope.switchCountry(d.geonameId);
          });

        flags.transition()
          .attr('x', function(d){ return d.cx - 16; })
          .attr('y', function(d){ return d.cy - 16; });

        /*
        var c_names = svg.selectAll('.c_name').data(circles_data, function(d) { return d.geonameId; });
        c_names.exit().remove();
        c_names.enter()
          .append('text')
          .attr('class', 'c_name')
          .text(function(d){ return d.countryName; })
          .attr("font-family", "sans-serif")
          .attr("font-size", "15px")
          .attr("fill", "black")
          .attr('style', 'cursor:pointer;')
          .on('click', function(d, i) {
            scope.switchCountry(d.geonameId);
          });

        var c_namesAttr = c_names.transition()
          .attr('x', function(d){ return d.cx - 10; })
          .attr('y', function(d){ return d.cy + 5; });
        */

      });

    }
  };
}]);
