var META_HOST = "";
var META_PORT = 0;
var USE_META = false;
var STATIC_HOSTS = [{host:"192.168.1.34",port:2592}];

var packer = require("./bufferpack");
var net = require('net');

var serverConn = net.connect(2592, "192.168.1.34", function() {
	console.log("connected to NT server!!");
	
	serverConn.on('data', function(sp_data) {
		console.log("FROM SERVER", sp_data, sp_data.length);
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

	newport = Math.floor(Math.random()*1000)+10000;
	cp_data = packer.pack("!bbbxI",[27,4,0,newport]);
	console.log("WRITING", cp_data);
	serverConn.write(new Buffer(cp_data));
	console.log("wrote data");
});

/*
var server = net.createServer(function(c) {
    console.log("someone connected to this new on-the-fly server!!")
})
server.listen(newport, function() { //'listening' listener
  console.log('server bound');
});
*/