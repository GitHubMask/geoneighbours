// --- GeoNames Service
app.provider('geonames', function() {

    'use strict';

    this.params = {};

    // --- Service init
    this.init  = function(params) {
      this.params.endpoint = params.endpoint;
      this.params.username = params.username;
      this.params.cache = params.cache;
    };

    this.$get = ['$http', '$q', 'CacheFactory', function($http, $q, CacheFactory) {

      var params = this.params;

      var geoCache = false;
      if (params.cache) {
        if (!CacheFactory.get('geoCache'))
          CacheFactory.createCache('geoCache');

        geoCache = CacheFactory.get('geoCache');
      }

      // --- Query builder
      function geonamesQueryBuilder(url, qparams, method) {
          qparams = qparams || {};
          qparams.username = params.username;
          var querystring = [];
          for (var p in qparams)
            querystring.push(encodeURIComponent(p) + "=" + encodeURIComponent(qparams[p]));

          url = params.endpoint + '/' + url;
          if (querystring.length)
            url = url + 'JSON?' + querystring.join("&");

          return {
            method: method || 'GET',
            url: url,
            headers: {
              'Content-Type': 'application/json',
            }
          };
      }

      // --- Query executer
      function geonamesQuery(url, qparams) {
        var start = new Date().getTime();
        var defer = $q.defer();
        var query = geonamesQueryBuilder(url, qparams);

        if (geoCache && geoCache.get(query.url)) {
          console.log('Time taken for ' + query.url + ' > ' + (new Date().getTime() - start) + 'ms [CACHE]');
          defer.resolve(geoCache.get(query.url));
        } else {
          $http(query)
            .success(function(data, status) {
              if (data.geonames)
                data = data.geonames;
              if (geoCache)
                geoCache.put(query.url, data);
              console.log('Time taken for ' + query.url + ' > ' + (new Date().getTime() - start) + 'ms [NO CACHE]');
              defer.resolve(data);
            })
          ;
        }

        return defer.promise;
      }

      // --- Geonames Service
      return {
        getCountries: function() {
          return geonamesQuery('countryInfo');
        },
        getCountryInfos: function(geoId) {
          return geonamesQuery('get', {geonameId: geoId});
        },
        getNeighbours: function(geoId) {
          return geonamesQuery('neighbours', {geonameId: geoId});
        }
      };
    }];
});
