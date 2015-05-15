importScripts("jspack.js");
importScripts("packets.js");
importScripts("lib/base64.js");

var buffer = "";
var reading = false;
var net_logging = false;

onmessage = function(msg) {
    buffer += Base64.decode(msg.data);
    if(!reading) readMessages();
}

readMessages = function() {
    // if there are no messages, stop (resume with the next msg event)
    if(buffer.length == 0) {
        reading = false;
        return;
    }

    reading = true;

    // get the message type
    var msgCode = buffer.charCodeAt(0);
    var msgClass = serverPackets[msgCode];

    if(msgClass === undefined) {
        postMessage("unknown message code " + msgCode);
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
        // send the handler for this message type and the data
        postMessage({ "msgCode":msgCode,
                      "data":packer.stringToBytes(data),
                      "clear": buffer.length == 0 });
        postMessage(buffer.length);
        readMessages();
    } else {
        // wait for more data
        reading = false;
        return;
    }
}
