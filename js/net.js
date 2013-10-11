/*
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

// This class handles all communication with the WebSocket (WS) server.
// The WS server is an intermediary between the browser and Netrek (NT) server.
// Sort of like a proxy, but it does a little more (e.g., metaserver queries).
// See node/server.node.js for the protocol and code
NetrekConnection = function(secure, webhost, webport, callback) {

    if(typeof window.Worker == "function") this.worker = new Worker("js/net_worker.js");

    this.host = webhost || "localhost";
	this.port = webport || 8080;
	
    this.serverHost = null;
    this.serverPort = null;

	this.conn = io.connect("ws"+(secure?"s":"")+"://"+this.host+":"+this.port);
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

        var onConnect = function() {
            document.title += " - " + _self.serverHost;
			_self.sendArray(CP_SOCKET.data(10));
            // if the browser has Web Worker support
            if(_self.worker) {
                // listen for messages from the worker
                _self.worker.addEventListener("message", function(evt) {
                    if(typeof evt.data == "object" && typeof evt.data.msgCode != "undefined") {
                        serverPackets[evt.data.msgCode].handler(evt.data.data);
                    }

                });

                // base64-decode all packets from the server and send them to the worker
			    this.on('message', function(e) {
                    _self.worker.postMessage(e);
                });
            } else {
			    this.on('message', function(e) {
                    // if the browser lacks Web Worker support, just do processing in a blocking way
                    _self.buffer += atob(e);
                    if(!_self.reading) { _self.readMessages(); }
                });
            }

            // listen for a closure notification from the server
            this.once('serverClosure', function() {
                console.warn('The Netrek server unexpected closed the connection. You probably timed out. Try reloading the page.');
            });

            _self.conn.removeListener(onError);

            // once everything is set up, do the specified callback
		    callback(true);
		}

        var onError = function() {
            _self.conn.removeListener(onConnect);
            callback(false);
        }

		this.conn.once('serverConnected', onConnect);
        this.conn.once("connectError", onError)
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
            // send data to the handler for this message type; this causes the action to occur
            msgClass.handler(packer.stringToBytes(data));
            this.readMessages();
        } else {
            this.reading = false;
            return;
        }
    }

    // injectData: inject fake server packets
    // used by the tutorial
    this.injectData = function() {
        
    }

}
