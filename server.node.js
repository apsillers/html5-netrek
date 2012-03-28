/**
Protocol:
[BROWSER]             [WEB SERVER]            [NETREK SERVER]
    | ---->[connect]-----> |                         |
    |                      |                         |	
	| --->serverDataReq--> |                         |  (optional)
    | <----serverData<---- |                         |
    |                      |                         |
    | ---->joinServer----> |                         |
    |                      |   ----[connect]---->    |
    | <--severConnected<-- |                         |
    |                      |                         |
    | <--------------------------------------------> |
    | <--------------[NETREK PROTOCOL]-------------> |
    | <------(the web server becomes a proxy)------> |
    | <--------------------------------------------> |
    |                      |                         |
    | --->[disconnect]---> |                         |
    |                      | ----->[disconnect]----> |

NOTES:
- In order to form the serverData message, the Web Server should query the
  metaserver; however, it could also hold a fixed list of known good clients.
- When the Netrek server (NS) sends a SP_PING packet, the Web server (WS)
  handles it directly.  This eliminates needless traffic to the client, since
  the WS can vouch that the client is still alive just as well as the browser.
*/

// info for the metaserver
var META_HOST = "";
var META_PORT = 0;
var USE_META = false;
var STATIC_HOSTS = [{host:"192.168.1.34",port:2592},{host:"127.0.0.1",port:2592}];

var packer = require("./bufferpack");
var net = require('net');
var express = require("express"),
    app = express.createServer();
// serve files
app.use(express.static(__dirname));
app.listen(8080);

var io = require('socket.io').listen(app);

// new browser client is connecting to the WS server
io.sockets.on('connection', function (socket) {
    console.log("CONNECTION");

    socket.on('serverDataReq', function (hostInfo) {
		if(USE_META) {
			// TODO: query metaserver and send server info to client
			var metaServerConn = net.connect(hostInfo.port, hostInfo.host, function() {
				socket.emit("serverData", []);
			});
		} else {
			// just use the static list of hosts
			socket.emit("serverData", STATIC_HOSTS);
		}
	});
	
    // the client has picked a server to join and passed info about which one
    socket.on('joinServer', function (hostInfo) {
        // make a new connection to the Netrek server
        try {
            var serverConn = net.connect(hostInfo.port, hostInfo.host, function() {
			    console.log("connected to NT server!");
                /* PROXY BEHAVIOR */
                // forward all data from the server to the browser client
                serverConn.on('data', function(sp_data) {
                    // base64-encode the Buffer of bytes and send it to the client
                    console.log("FROM SERVER", sp_data);
				    socket.send(sp_data.toString("base64"));
                });

			    serverConn.on('end', function() {
                    console.log("server connection finished");
                });

			    serverConn.on('close', function() {
                    console.log("server connection died");
                });

			    serverConn.on('error', function(e) {
                    console.log("socket error",e);
                });

                // foward all data from the browser client to the server
                // data is an array of ints valued 0 - 255
			    // TODO: or should it be a base64 string?
                socket.on('message', function(cp_data) {
                    cp_data = new Buffer(cp_data, "base64");
				    console.log("FROM CLIENT", cp_data);
                    serverConn.write(cp_data);
                });

                socket.on('disconnect', function() {
                    console.log("DISCONNECT");
                    serverConn.end();
                    // TODO: clean up connection
	                // send CP_QUIT/CP_BYE message? (unless the client never picked a
                    // server or already exited gracefully)
                });
                /* END PROXY BEHAVIOR */
                
                // connection made to real server; browser can now send data
                socket.emit('serverConnected');
            });
        } catch(err) {
                socket.emit('connectionFailed');
        }
    });
});
