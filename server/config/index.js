'use strict';

var config = require('nodejs-config')(__dirname + '/..', function(){
  return process.env.NODE_ENV || "development";
});

module.exports = config;
