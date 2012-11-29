NetrekConnection = function(callback) {

    var errorFunc = function(e) { alert(e); }

    this.buffer = "";
    this.socketId = 0;
    var self = this;
    
    this.getSeverList = function(callback) {
        callback();
    }
    
    this.connectToServer = function(host, port, callback) {
        TCPSockets.createSocket(host, port, function(socketId) {
            self.socketId = socketId;
            document.title += " - " + host;
			self.sendArray(CP_SOCKET.data(10));

            self.readMessages();
            callback();
        }, errorFunc);
        
    }
    
    this.readMessages = function() {
        TCPSockets.read(self.socketId, function(bufferout) {
            self.buffer += bufferout;
            self.execMessages();
        });
    }
    
    this.execMessages = function() {
        // no messages in buffer; wait until the socket has new messages
        if(this.buffer.length == 0) {
            return;
        }
    
        var msgCode = self.buffer.charCodeAt(0);
        var msgClass = serverPackets[msgCode];
        
        if(msgClass === undefined) {
            console.error("unknown message code " + msgCode);
            this.buffer = this.buffer.substr(1);
            this.execMessages();
        }
        
        var length = packer.calcLength(msgClass.format);
        var data = this.buffer.substr(0, length);
        
        if(data.length == length) {
            this.buffer = this.buffer.substr(length);
            msgClass.handler(packer.stringToBytes(data));
            this.execMessages();
        } else {
            return;
        }
    }
    
    this.sendArray = function(data_array) {
        TCPSockets.send(this.socketId, data_array, (function() {}), errorFunc);
    }

    setTimeout(callback, 4);
}

Array.prototype.next = function() {
    return this.splice(0,1)[0];
}

