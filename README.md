#HTML5 Netrek Client#

This is a HTML5 browser-based client for the game [Netrek](http://www.netrek.org/).  The project includes:

  1. client-side files, including JavaScript code that uses socket.io

  2. `server.node.js`, a Socket.io-to-TCP proxy which can also serve Web content.  The proxy is necessary for the client to connect, since a browser cannot directly connect to a raw Netrek TCP server/socket.

**To see a live demo, visit https://netrek-apsillers.rhcloud.com/**

##Code Overview##

The code is mainly in /js at the moment:

* **main.js** - handles startup logic (mostly login screen logic)
* **world.js** - handles user input (key presses, mouse clicks) and manages all objects in the game
* **outfitting.js** - draws the outfitting screen and sends/receives relevant net info
* **ui.js** - draws and updates the UI meters for the player (shields, fuel, etc)
* **ship.js** - represents a ship; information sent to a ship object is used to update its local and tactical graphics
* **phaser.js**, **torp.js** - representations of phasers and torpedoes
* **net.js** - makes connections (through the proxy), reads the data stream, and delegates work to message objects, which performs virtually all server-driven action; e.g., when a `SP_YOU` message comes in, the net object should read it and send the data to the `SP_YOU` handler, which should update the UI with info about the player
* **packets.js** - contains a class for each message type, which includes the message's ID code, data fields, and function to run when the packet is recieved
* **images.js** - simple image preloader and image array
* **constants.js** - global constants used in Netrek protocol and ship max stats (max fuel, max hull, etc.)

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

There is an instance at https://netrek-apsillers.rhcloud.com running on the OpenShift PaaS.

The code could be ported to run as a browser extension, where it might be able to take advantage of native TCP/UDP support. To build such a port, the `/js/net.js` file would need to be rewritten slightly to use native networking capabilities instead of socket.io. All other code can remain the same; `net.js` is the heart of the application, since it is responsible for processing all information from the server and sending tasks to `packets.js`, which is connection-agnostic.

There is an PhoneGap Android application (using a custom-made plugin for TCP communication) as a branch on this repository. It has not been updated in some time, and is missing many of the features of the master branch.

##Copyright and License##

The HTML5 Netrek Client is released under the terms of the GNU General Public License, version 3. (See the COPYING file for the full text of the license.) Some files are taken nearly verbatim from James Cameron's [Gytha client](http://quozl.us.netrek.org/gytha/); those files are marked as such.
Currently, they include `packets.js` and `constants.js`.

Art assets in `/data` are taken directly from the [COW Client](http://www.netrek.org/downloads/clients/#cow) and are licensed under a permisive MIT-style license. Author information is uncertain, but the artists probably include:

* Brandon Gillespie
* Mike McGrath
* Joe Rumsey
* Ola Andersson


