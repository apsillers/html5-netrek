#HTML5 Netrek Client#

This is a HTML5 browser-based client for the game Netrek.  It includes:

  1. client-side files, including JavaScript code that uses socket.io

  2. `server.node.js`, a Socket.io-to-TCP proxy which can also serve content.  (This may be replaced with websockify, since it does nearly the same thing, and might handle errors more gracefully.)  The proxy is necessary for the client to connect, since a browser cannot directly connect to a raw Netrek TCP server/socket.

##Code Overview##

The code is mainly in /js at the moment:

* **world** - handles user input and manages all objects in the game
* **outfitting** - draws the outfitting screen and sends/receives relevant net info
* **ui** - draws and updates the UI meters for the player (shields, fuel, etc)
* **ship** - represents a ship; information sent to a ship object is used to update its local and tactical graphics
* **net** - makes connections (through the proxy), reads the data stream, and delegates work to message objects, which perform virtually all server-driven action; e.g., when a `SP_YOU` message comes in, the net object should read it and send the data to the `SP_YOU` hnadler, which should update the UI with info about the player
* **packets** - contains a class for each message type, which includes the message's ID code, data fields, and function to run when the packet is recieved

Each file (except for a few, like `ship.js`) includes a singleton.  The code is built around a few powerful singletons that each handle a single aspect of the program (world, net, outfitting...).  These are namespaces that allow the code to be read/used in a sane way that doesn't polute the global namespace.

##Libraries##

Included libraries:

* **jspack** - a Python-like data packing library for packing/unpacking net data
* **jquip** - lightweight jQuery clone, used only for event normalization (mouse click x/y)
* **cake.js** - scene-graph-based canvas drawing library

Required node.js libraries to run sever.js:

* **socket.io** - handles cross-browser two-way-push network communication; uses WebSockets where possible
* **express** - used to serve files

##Deployment Notes##

The code can be pushed to Nodester as-is in order to run an public instance. Once such instance is http://trekproxy.nodester.com/.

The code could be ported to run as a browser extension, where it might be able to take advantage of native TCP/UDP support. To build such a port, the `/js/net.js` file would need to be rewritten slightly to use native networking capabilities instead of socket.io. All other code can remain the same; `net.js` is the heart of the application, since it is responsible for processing all information from the server and sending tasks to `packets.js`, which is connection-agnostic.

I have created experimental ports that are not yet ready for testing. These include a Chrome extension (using the new `chome.socket` API) and a PhoneGap Android application (using a custom-made plugin for TCP communication). These ports will be posted as branches if/when they are reach an basic level of usability.

##Copyright and License##

The HTML5 Netrek Client is released under the terms of the GNU General Public License, version 3. (See the COPYING file for the full text of the license.) Some files are taken nearly verbatim from James Cameron's [Gytha client](http://quozl.us.netrek.org/gytha/); those files are marked as such.
Currently, they include `packets.js` and `constants.js`.

Art assets in `/data` are taken directly from the [COW Client](http://www.netrek.org/downloads/clients/#cow) and are licensed under a permisive MIT-style license.


