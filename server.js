#!/usr/bin/env
'use strict';

const server = require('./app');
const port = 5000 ;

server.listen(port, function() {
  console.log('Server running on port: %d', port);
});
