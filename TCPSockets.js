var TCPSockets = function() {};

TCPSockets.createSocket = function(host, port, successCallback, failureCallback) {
    //alert("connecting to " + host);
    cordova.exec(successCallback,
                         failureCallback,
                         'TCPSockets',
                         'createSocket',
                         [
                            host,
                            port
                         ]
    )
}


TCPSockets.send = function(socketId, message, successCallback, failureCallback) {
    //alert("sending data of len " + message.length + " on socket #" + socketId);

    cordova.exec(successCallback,
                         failureCallback,
                         'TCPSockets',
                         'send',
                         [
                          socketId,
                          btoa(String.fromCharCode.apply(null, message))
                         ]
    )
}


TCPSockets.read = function(socketId, successCallback, failureCallback) {
    cordova.exec(function(result) { successCallback(atob(result)); },
                         failureCallback,
                         'TCPSockets',
                         'read',
                         [socketId]
    )
}