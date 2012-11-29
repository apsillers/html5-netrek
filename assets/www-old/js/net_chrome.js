NetrekConnection = function(dummy_host, dummy_port, callback) {

    this.buffer = "";
    this.socketId = 0;
    var self = this;
    
    this.getSeverList = function(callback) {
        
    }
    
    this.connectToServer = function(host, port, callback) {
        chrome.socket.connect(this.socketId, host, port, function() {
            document.title += " - " + self.serverHost;
			self.sendArray(CP_SOCKET.data(10));

            self.readMessages();
            callback();
        });
        
    }
    
    this.readMessages = function() {
        chrome.socket.read(this.socketId, function(readInfo) {
            if (readInfo.resultCode > 0) {
                console.log(String.fromCharCode.apply(null, new Uint8Array(readInfo.data)))
                self.buffer += String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
                self.execMessages();
                self.readMessages();
            }
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
        chrome.socket.write(this.socketId, new Uint8Array(data_array).buffer, function(){});
    }
    
    
    // create the socket
    chrome.socket.create('tcp', {}, function(createInfo) {
        self.socketId = createInfo.socketId;
        callback();
    });
}

Array.prototype.next = function() {
    return this.splice(0,1)[0];
}
