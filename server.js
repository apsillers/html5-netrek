/**
    Copyright (C) 2012 Andrew P. Sillers (apsillers@gmail.com)

    This file is part of the HTML5 Netrek Client.

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

// info for the metaserver
var STATIC_HOSTS = [
    {host:"continuum.us.netrek.org",port:2592},
    {host:"pickled.netrek.org",port:2592},
    {host:"netrek.apsillers.com",port:2592},
];

var net = require('net');
var express = require("express"),
    app = express()
  , http = require('http')
  , server = http.createServer(app)
// serve files
app.use(express.static(__dirname));

// get the port from either: heroku port var, nodester port var, command-line arg, or use 16446
var port = process.env.app_port || process.env.PORT || process.argv[2] || 16446;
console.log("listening on port " + port)
server.listen(port);

