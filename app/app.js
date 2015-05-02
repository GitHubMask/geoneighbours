// --- The app
var app = angular.module('gnApp', ['ui.router', 'angular-cache']);

// --- Services init
app.config(['geonamesProvider', 'CacheFactoryProvider', function(geonamesProvider, CacheFactoryProvider){

  'use strict';

  // --- Geonames service init
  geonamesProvider.init({
    endpoint: 'http://api.geonames.org',
    username: 'mask',
    cache: true,
  });

  // --- Angular Cache settings
  angular.extend(CacheFactoryProvider.defaults, {
    maxAge: 15 * 60 * 1000,
    storageMode: 'localStorage',
  });
}]);

// --- Routing
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  'use strict';

  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('gn', {
      url: '/',
      controller: 'gnCtrl',
      templateUrl: 'templates/main.html',
      resolve:{
        r_countries: ['geonames', function(geonames){
          return geonames.getCountries().then(function(stuff){
              return stuff;
          });
        }],
      }
    })
    .state('about', {
      url: '/about',
      templateUrl: 'templates/about.html',
    });
}]);

// --- Main Controller
app.controller('gnCtrl', ['$scope', 'geonames', 'r_countries', function($scope, geonames, r_countries){

  'use strict';

  // --- Init
  $scope.countries = r_countries;
  $scope.selectedCountry = $scope.countries[0];
  $scope.neighbours = [];

  $scope.switchCountry = function(geonameId) {
    for (var i=0; i<$scope.countries.length;i++) {
      if ($scope.countries[i].geonameId === geonameId)
        $scope.selectedCountry = $scope.countries[i];
    }
  }

  $scope.$watch('selectedCountry', function(newVal, oldVal){
    geonames
      .getNeighbours(newVal.geonameId)
      .then(function(stuff){
        $scope.neighbours = stuff;
      });
  });


}]);
