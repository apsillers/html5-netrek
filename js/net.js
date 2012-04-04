// This class handles all communication with the WebSocket (WS) server.
// The WS server is an intermediary between the browser and Netrek (NT) server.
// Sort of like a proxy, but it does a little more (e.g., metaserver queries).
// See node/server.node.js for the protocol and code
NetrekConnection = function(webhost, webport, callback) {

    if(typeof window.Worker == "function") this.worker = new Worker("js/net_worker.js");

    this.host = webhost || "localhost";
	this.port = webport || 8080;
	
    this.serverHost = null;
    this.serverPort = null;

	this.conn = io.connect("ws://"+this.host+":"+this.port);
	this.conn.once("connect",callback);
	
    // the stream of Netrek messages we haven't resolved yet
    this.buffer = "";

    // are we currently reading? (i.e., is there an outstanding timeout that will be reading soon)
    this.reading = false;

    // getServerList: Ask the WS which NT servers are available.
    // This function expects a callback, which is provided an array of objects:
    //      [{ host:"...", port:####, status:"..." }, ...]
    //
    // (note that the WS should query the meta server for this info, but it is
    //  possible the WS could just lie and/or list only a few favored servers)
    this.getServerList = function(callback) {
        this.conn.once("serverData", function(serverList) {
            if(typeof callback === "function"){ callback(serverList); }
        });
        this.conn.emit("serverDataReq");
    }

    // connectToServer: tell the WS server we want to join a server
    // Sets up a message listener, which expects Netrek data
	this.connectToServer = function(host, port, callback) {
		port = port || 2592;
        this.serverHost = host;
        this.serverPort = port;
        var _self = this;
		this.conn.once('serverConnected', function() {
            document.title += " - " + _self.serverHost;
			_self.sendArray(CP_SOCKET.data(10));
            // if the browser has Web Worker support
            if(_self.worker) {
                // listen for messages from the worker
                _self.worker.addEventListener("message", function(evt) {
                    serverPackets[evt.data.msgCode].handler(evt.data.data);
                });

                // base64-decode all packets from the server and send them to the worker
			    this.on('message', function(e) {
                    _self.worker.postMessage(e);
                });
            } else {
			    this.on('message', function(e) {
                    // if the browser lacks Web Worker support, just do processing in a blocking way
                    _self.buffer += atob(e);
                    if(!_self.reading) _self.readMessages();
                });
            }

            // listen for a closure notification from the server
            this.once('serverClosure', function() {
                console.warn('The Netrek server unexpected closed the connection. You probably timed out. Try reloading the page.');
            });

            // once everything is set up, do the specified callback
		    callback();
		});
		this.conn.emit('joinServer', {host:host, port:port});
	}

    this.sendArray = function(data_array) {
        this.conn.send(btoa(String.fromCharCode.apply(this, data_array)));
    }

    // readMessages: read the next message from the server and act on it.
    // Messages are read from this object's buffer, which stores all incoming
    // data messages.  Once read, messages are removed from the buffer.
    this.readMessages = function() {
        // if there are no messages, stop (resume with the next msg event)
        if(this.buffer.length == 0) {
            this.reading = false;
            return;
        }

        this.reading = true;

        // get the message type
        var msgCode = this.buffer.charCodeAt(0);
        var msgClass = serverPackets[msgCode];

        if(msgClass === undefined) {
            console.error("unknown message code " + msgCode);
            this.buffer = this.buffer.substr(1);
            this.readMessages();
            return;
        }

        // get the length of the message and skim data off the buffer
        var length = packer.calcLength(msgClass.format);
        var data = this.buffer.substr(0,length);
        // only read if there is a full message on the buffer; otherwise stop
        if(data.length == length) {
            this.buffer = this.buffer.substr(length);
            // send data to the handler for this message type
            msgClass.handler(packer.stringToBytes(data));
            setTimeout(this.readMessages(), 0);
        } else {
            this.reading = false;
            return;
        }
    }

}


Array.prototype.next = function() {
    return this.splice(0,1)[0];
}

