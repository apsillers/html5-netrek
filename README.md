This is a HTML5 browser-based client for the game Netrek.  It includes client
files and a WebSocket-to-TCP proxy.  (This should be replaced with websockify
ASAP, since it keeps crashing whenever errors happen on the client.)  The
proxy must run somewhere in order for the client to connect, since a browser
cannot directly connect to a raw Netrek TCP server/socket.

The code is mainly in /lib at the moment:
world - handles user input and manages all objects in the game
outfitting - draws the outfitting screen and sends/receives relevant net info
ui - draws and updates the UI meters for the player (shields, fuel, etc)
ship - represents a ship; information sent to a ship object is used to update
       its local and tactical graphics
net - makes connections (through the proxy), reads the data stream, and
      delegates work to message objects, which perform virtually all
      server-driven action; e.g., when a SP_YOU message comes in, the net
      object should read it and send the data to the SP_YOU hnadler, which
      should update the UI with info about the player

Each file (except for a few, like ship.js) includes a singleton.  The code is
built around a few powerful singletons that handle a single aspect of the
program (world, net, outfitting...).  These are basically namespaces so we can
use/read the code in a sane way and not polute the global namespace.

Included libraries:
jspack - a Python-like data packing library for packing/unpacking net data
jquery - used only for event normalization (mouse click x/y)
cake - used for all canvas drawing ever


