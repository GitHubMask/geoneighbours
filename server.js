'use strict';

var config = require('./config')
var winston = require('winston');
var path = require('path');
var express = require('express');

// --- This app !
var app = express();

// --- Static directory set at {{app_root}}/public
app.use(express.static(path.join(__dirname, 'public')));

// --- Server listen
var server = app.listen(config.get('app').port, function () {
  var host = server.address().address;
  var port = server.address().port;
  winston.info('Geoneighbours is served at http://%s:%s', host, port);
});
