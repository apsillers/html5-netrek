// This class handles all communication with the WebSocket (WS) server.
// The WS server is an intermediary between the browser and Netrek (NT) server.
// Sort of like a proxy, but it does a little more (e.g., metaserver queries).
// See node/server.node.js for the protocol and code
NetrekConnection = function(webhost, webport, callback) {

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
            // base64-decode all messages from the server
			this.on('message', function(e) {
                _self.buffer += atob(e);
                _self.readMessages();
            });
            this.once('serverClosure', function() { alert('The Netrek server unexpected closed the connection.  You probably timed out.  Anyway, try reloading the page.'); })
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
            this.readMessages();
        } else {
            this.reading = false;
            return;
        }
    }

}


Array.prototype.next = function() {
    return this.splice(0,1)[0];
}

net_logging = false;
/*
 All server packet types listed below

 See http://james.tooraweenah.com/darcs/netrek-server/Vanilla/include/packets.h
 for an explanation of how the netrek protocol works

 Each packet object contains:
   - the packet's identifying code,
   - pack format (for unpacking off the network; see Python's pack docs),
   - handler function (what we do when this kind of packet arrives)
*/
serverPackets = [
  { // SP_MOTD
    code: 11,
    format: '!bxxx80s',
    handler: function(data) {
        var unpacked = packer.unpack(this.format, data);
        if(unpacked) message = unpacked[1];
        if(net_logging) console.log(message);
    }
  },
  { // SP_YOU
    code: 12,
    format: '!bbbbbbxxIlllhhhh',
    handler: function(data) {
        // unpack all the data into variables
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(),   hostile = uvars.next(),
            swar = uvars.next(),    armies = uvars.next(), tractor = uvars.next(),
            flags = uvars.next(),   damage = uvars.next(), shield = uvars.next(),
            fuel = uvars.next(),    etemp = uvars.next(),  wtemp = uvars.next(),
            whydead = uvars.next(), whodead = uvars.next();
        if(net_logging) console.log("SP_YOU pnum=",pnum,"hostile=",team_decode(hostile),"swar=",team_decode(swar),
                    "armies=",armies,"tractor=",tractor,"flags=",flags.toString(2),"damage=",
                    damage,"shield=",shield,"fuel=",fuel,"etemp=",etemp,"wtemp=",
                    wtemp,"whydead=",whydead,"whodead=",whodead);
        if(world.playerNum == null) { world.playerNum = pnum; }
        hud.showFuelLevel(fuel/100);
        hud.showHullLevel(100-damage/100);
        hud.showShieldLevel(shield/100);
    }
  },
  { // SP_PL_LOGIN
    code: 24,
    format: "!bbbx16s16s16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), rank = uvars.next(),
            name = uvars.next(), monitor = uvars.next(), login  = uvars.next();
        if(net_logging) console.log("SP_PL_LOGIN pnum=",pnum,"rank=",rank,"name=",name,"monitor=",monitor,"login=",login)
        //ship = galaxy.ship(pnum)
        //ship.sp_pl_login(rank, name, monitor, login)
    }
  },
  { // SP_HOSTILE
    code: 22,
    format: "!bbbb",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), war = uvars.next(),
            hostile = uvars.next();
        if(net_logging) console.log("SP_HOSTILE pnum=",pnum,"war=",team_decode(war),"hostile=",team_decode(hostile));
    }
  },
  { // SP_PLAYER_INFO
    code: 2,
    format:"!bbbb",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), shiptype = uvars.next(), team = team_decode(uvars.next());
        if(net_logging) console.log("SP_PLAYER_INFO pnum=",pnum,"shiptype=",shiptype,"team=",team);
        var img = imageLib.images[team.length?team[0]:FED][shiptype];
        if(world.ships[pnum] == undefined) world.addShip(pnum, new Ship({ img: img, galImg: imageLib.images[1][shiptype], 
team:team[0]||1, number:pnum.toString() }));
    }
  },
  { // SP_KILLS
    code: 3,
    format:"!bbxxI",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), kills = uvars.next();
        if(net_logging) console.log("SP_KILLS pnum=",pnum,"kills=",kills);
    }
  },
  { // SP_PSTATUS
    code: 20,
    format:"!bbbx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), status = uvars.next();
        if(net_logging) console.log("SP_PSTATUS pnum=",pnum,"status=",status);
    }
  },
  { // SP_PLAYER
    code: 4,
    format:"!bbBbll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), dir = uvars.next(), speed = uvars.next(), x = uvars.next(), y = uvars.next();
        if(net_logging) console.log("SP_PLAYER pnum=",pnum,"dir=",dir,"speed=",speed,"x=",x,"y=",y);
        world.ships[pnum].setRotation(dir);
        world.ships[pnum].setPosition(x, y);
        world.ships[pnum].speed = speed;
    }
  },
  { // SP_FLAGS
    code: 18,
    format:"!bbbxI",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), tractor = uvars.next(), flags = uvars.next();
        if(net_logging) console.log("SP_FLAGS pnum=",pnum,"tractor=",tractor,"flags=",flags);
    }
  },
  { // SP_PLANET_LOC
    code: 26,
    format:"!bbxxll16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), x = uvars.next(), y = uvars.next(), name = uvars.next();
        if(net_logging) console.log("SP_PLANET_LOC pnum=",pnum,"x=",x,"y=",y,"name=",name);
        if(world.planets[pnum] == undefined) {
            world.addPlanet(pnum, new world.Planet(x, y, name, [], world));
        }
    }
  },
  { // SP_LOGIN
    code: 17,
    format:"!bbxxl96s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), accept = uvars.next(), flags = uvars.next(), keymap = uvars.next();
        if(net_logging) console.log("SP_LOGIN accept=",accept,"flags=",flags.toString(2));
    }
  },
  { // SP_MASK
    code: 19,
    format:"!bbxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), mask = uvars.next();
        if(net_logging) console.log("SP_MASK mask=",team_decode(mask));
    }
  },
  { // SP_PICKOK
    code: 16,
    format:"!bbxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), state = uvars.next();
        if(net_logging) console.log("SP_PICKOK state=", state);
        if(state == 1) {
            outfitting.undraw();
            world.ships[world.playerNum]; 
            world.draw();
        }
    }
  },
  { // SP_RESERVED
    code: 25,
    format:"!bxxx16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), data = uvars.next();
        var text = packer.unpack('16b', data)
        if(net_logging) console.log("SP_RESERVED data=",text);
    }
  },
  { // SP_TORP_INFO
    code: 5,
    format:"!bbbxhxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), war = uvars.next(), status = uvars.next(), tnum = uvars.next();
        if(net_logging) console.log("SP_TORP_INFO war=",team_decode(war)," status=",status," tnum=",tnum);
        if(world.torps[tnum] == undefined && status == 1) {
            world.addTorp(tnum, new Torp(-10000, -10000, 0, war, world));
        }
        if(world.torps[tnum] != undefined && status == 0) {
            world.removeTorp(tnum);
        }
    }
  },
  { // SP_TORP
    code: 6,
    format:"!bBhll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), dir = uvars.next(), tnum = uvars.next(), x = uvars.next(), y = uvars.next();
        if(net_logging) console.log("SP_TORP dir=",dir," tnum=",tnum," x=",x," y=",y);
        if(world.torps[tnum] != undefined) {
            world.torps[tnum].dir = dir;
            world.torps[tnum].x = x;
            world.torps[tnum].y = y;
        }
    }
  },
  { // SP_PLASMA_INFO
    code: 8,
    format:"!bbbxhxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), war = uvars.next(), status = uvars.next(), pnum = uvars.next();
        if(net_logging) console.log("SP_PLASMA_INFO war=",team_decode(war),"status=",status,"pnum=",pnum);
    }
  },
  { // SP_PLASMA
    code: 9,
    format:"!bxhll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), x = uvars.next(), y = uvars.next();
        if(net_logging) console.log("SP_PLASMA pnum=",pnum,"x=",x,"y=",y);
    }
  },
  { // SP_STATUS
    code: 14,
    format:"!bbxxIIIIIL",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), tourn = uvars.next(),
            armsbomb = uvars.next(), planets = uvars.next(),
            kills = uvars.next(), losses = uvars.next(), time = uvars.next(),
            timeprod = uvars.next();
        if(net_logging) console.log("SP_STATUS tourn=",tourn,"armsbomb=",armsbomb,"planets=",planets,"kills=",kills,"losses=",losses,"time=",time,"timepro=",timeprod);
    }
  },
  { // SP_PHASER
    code: 7,
    format:"!bbbBlll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), status = uvars.next(), dir = uvars.next(), x = uvars.next(), y = uvars.next(), target = uvars.next();
        if(net_logging) console.log("SP_PHASER pnum=",pnum,"status=",status,"dir=",dir,"x=",x,"y=",y,"target=",target);
    }
  },
  { // SP_PLANET
    code: 15,
    format:"!bbbbhxxl",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), owner = uvars.next(), info = uvars.next(), flags = uvars.next(), armies = uvars.next();
        if(net_logging) console.log("SP_PLANET pnum=",pnum,"owner=",owner,"info=",info,"flags=",flags.toString(2),"armies=",armies);
    }
  },
  { // SP_MESSAGE
    code: 1,
    format:"!bBBB80s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), m_flags = uvars.next(),
            m_recpt = uvars.next(), m_from = uvars.next(), mesg = uvars.next();
        if(net_logging) console.log("SP_MESSAGE m_flags=",m_flags.toString(2),"m_recpt=",m_recpt,"m_from=",m_from,"mesg=",mesg);
    }
  },
  { // SP_STATS
    code: 23,
    format:"!bbxx13l",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), pnum = uvars.next(), tkills = uvars.next(),
            tlosses = uvars.next(), kills = uvars.next(),
            losses = uvars.next(), tticks = uvars.next(),
            tplanets = uvars.next(), tarmies = uvars.next(),
            sbkills = uvars.next(), sblosses = uvars.next(),
            armies = uvars.next(), planets = uvars.next(),
            maxkills = uvars.next(), sbmaxkills = uvars.next();
        if(net_logging) console.log("SP_STATS pnum=",pnum, "tkills=",tkills,
                    "tlosses=",tlosses, "kills=",kills, "losses=",losses,
                    "tticks=",tticks, "tplanets=",tplanets, "tarmies=",tarmies,
                    "sbkills=",sbkills, "sblosses=",sblosses, "armies=",armies,
                    "planets=",planets, "maxkills=",maxkills, "sbmaxkills=",
                    sbmaxkills);
    }
  },
  { // SP_WARNING
    code: 10,
    format: '!bxxx80s',

    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.next(), message = uvars.next();
        if(net_logging) console.log("SP_WARNING message=", message);
    }
  },
]

CP_SOCKET = {
    code: 27,
    format: '!bbbxI',

    data: function(tcpVersion) {
        if(net_logging) console.log("CP_SOCKET");
        return packer.pack(this.format,[this.code,4,tcpVersion,0]);
    }
}  
CP_LOGIN = {
    code: 8,
    format: '!bbxx16s16s16s',

    data: function(query, name, password, login) {
        if(net_logging) console.log("CP_LOGIN query=",query,"name=",name);
        return packer.pack(this.format, [this.code, query, name, password, login])
    }
}
CP_UPDATES = {
    code: 31,
    format: '!bxxxI',

    data: function(usecs) {
        if(net_logging) console.log("CP_UPDATES usecs=",usecs);
        return packer.pack(this.format, [this.code, usecs]);
    }
}
CP_OUTFIT = {
    code: 9,
    format: '!bbbx',

    data: function(race, ship) {
        if(net_logging) console.log("CP_OUTFIT team=",race_decode(race),"ship=",ship);
        return packer.pack(this.format, [this.code, race, ship]);
    }
}
CP_SPEED = {
    code: 2,
    format: '!bbxx',

    data: function(speed) {
        if(net_logging) console.log("CP_SPEED speed=",speed);
        return packer.pack(this.format, [this.code, speed]);
    }
}
CP_DIRECTION = {
    code: 3,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_DIRECTION direction=",direction);
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}


CP_PHASER = {
    code: 4,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_PHASER direction=",direction);
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}
CP_PLASMA = {
    code: 5,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_PLASMA direction=",direction);
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}
CP_TORP = {
    code: 6,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_TORP direction=",direction);
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}



// index all packets by code number
var sp = [];
for(var i=0;i<serverPackets.length;++i) {
  sp[serverPackets[i].code] = serverPackets[i];
}
serverPackets = sp;

// convert a team mask to a list
function team_decode(mask) {
    var x = []
    if (mask & FED) x.push(FED)
    if (mask & ROM) x.push(ROM)
    if (mask & KLI) x.push(KLI)
    if (mask & ORI) x.push(ORI)
    return x;
}
function race_decode(race) {
    switch(race) {
        case 0: return "IND";
        case 1: return "FED";
        case 2: return "ROM";
        case 4: return "KLI";
        case 8: return "ORI";
    }
}
