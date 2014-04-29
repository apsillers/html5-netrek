/*
    Copyright (C) 2012 Andrew P. Sillers (apsillers@gmail.com)

    The structure of this file borrows heavily from the Gytha client,
      which is Copyright (C) 2007-2011  James Cameron (quozl@us.netrek.org)

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


  This file lists all supported server and client messages (sometimes called
  "packets", but a TCP/UDP packet can have many messages in it).

 See http://james.tooraweenah.com/darcs/netrek-server/Vanilla/include/packets.h
 for an explanation of how the netrek protocol works
*/
net_logging = false;


/*
    CLIENT MESSAGES - these objects all contain a data() member function that
    returns an array of bytes, which can be sent to the server using
    net.sendArray()
*/
CP_SOCKET = {
    code: 27,
    format: '!bbbxI',

    data: function(tcpVersion) {
        if(net_logging) console.log("CP_SOCKET");
        return packer.pack(this.format,[this.code,4,tcpVersion,0]);
    }
}  
CP_PING_RESPONSE = {
    code: 42,
    format: "!bBbxll",

    data: function(number, pingme, cp_sent, cp_recv) {
        if(net_logging || true) console.log("CP_PING_RESPONSE pingme=", pingme);
        return packer.pack(this.format, [this.code, number, pingme, cp_sent, cp_recv]);
        // From James Cameron's pygame file (this may or may not apply to the JS version):
        // FIXME: bug #1215317195 reported by Zach, pinging the player
        // using "!" results in O0 PING stats: Avg: 364 ms, Stdv: 19
        // ms, Loss: ^@100.0%/nan% s->c/c->s
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
        if(net_logging) console.log("CP_OUTFIT team=",teamLib.raceDecode(race),"ship=",ship);
        return packer.pack(this.format, [this.code, race, ship]);
    }
}
CP_SPEED = {
    code: 2,
    format: '!bbxx',

    data: function(speed) {
        if(net_logging) console.log("CP_SPEED speed=",speed);
        if(tutorial.active) {
            if(speed==0) { tutorial.handleKeyword("speed0"); }
	    if(speed==2) { tutorial.handleKeyword("speed2"); }
            if(speed==5) { tutorial.handleKeyword("speed5"); }
        }
        return packer.pack(this.format, [this.code, speed]);
    }
}
CP_DIRECTION = {
    code: 3,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_DIRECTION direction=",direction);
        if(tutorial.active) tutorial.handleKeyword("direct");
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}

CP_MESSAGE = {
    code: 1,
    format: "!bBBx80s",

    data: function(group, indiv, mesg) {
        if(net_logging) console.log("CP_MESSAGE group=",group,"indiv=",indiv,"mesg=",mesg);

        if ((group == MGOD)) {
            $("#inbox").append(mesg + "<br />");
            $("#inbox").scrollTop($("#inbox").height())
        }

        return packer.pack(this.format, [this.code, group, indiv, mesg]);
    }
}

CP_PHASER = {
    code: 4,
    format: '!bBxx',

    data: function(direction) {
        if(net_logging) console.log("CP_PHASER direction=",direction);
        if(tutorial.active) { tutorial.handleKeyword("phaser"); }
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
        if(tutorial.active) { tutorial.handleKeyword("torp"); }
        return packer.pack(this.format, [this.code, direction & 255]);
    }
}
CP_DET_TORPS = {
    code: 20,
    format: '!bxxx',

    data: function() {
        if(net_logging) console.log("CP_DET_TORPS");
        return packer.pack(this.format, [this.code])
    }
}
CP_DET_MYTORP = {
    code: 21,
    format: '!bxh',

    data: function(tnum) {
        if(net_logging) console.log("CP_DET_MYTORP");
        if(tutorial.active) { tutorial.handleKeyword("detmytorp"); }
        return packer.pack(this.format, [this.code, tnum])
    }
}
CP_TRACTOR = {
    code: 24,
    format: '!bbbx',

    data: function(state, pnum) {
        if(net_logging) console.log("CP_TRACTOR state=",state,"pnum=",pnum);
        return packer.pack(this.format, [this.code, state, pnum]);
    }
}
CP_REPRESS = {
    format: '!bbbx',

    data: function(state, pnum) {
        if(net_logging) console.log("CP_REPRESS state=",state,"pnum=",pnum);
        return packer.pack(this.format, [this.code, state, pnum]);
    }
}
CP_CLOAK = {
    code: 19,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_CLOAK state=",state);
        if(tutorial.active) {
            if(state==1) { tutorial.handleKeyword("cloakon"); }
            if(state==0) { tutorial.handleKeyword("cloakoff"); }
        }
        return packer.pack(this.format, [this.code, state]);
    }
}
CP_REPAIR = {
    code: 13,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_REPAIR state=",state);
        if(tutorial.active) { tutorial.handleKeyword("repair"); }
        return packer.pack(this.format, [this.code, state]);
    }
}
CP_SHIELD = {
    code: 12,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_SHIELD state=",state);
        if(tutorial.active) { tutorial.handleKeyword("shields"); }
        return packer.pack(this.format, [this.code, state]);
    }
}
CP_ORBIT = {
    code: 14,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_ORBIT =",state);
        return packer.pack(this.format, [this.code, state]);
    }
}
CP_BOMB = {
    code: 17,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_BOMB state=",state);
        return packer.pack(this.format, [this.code, state]);
    }
}
CP_BEAM = {
    code: 18,
    format: '!bbxx',

    data: function(state) {
        if(net_logging) console.log("CP_BEAM state=",state);
        return packer.pack(this.format, [this.code, state]);
    }
}
/*************************************************************************
 All server packet types listed below

 Each packet object contains:
   - the packet's identifying code byte
   - pack format string (for unpacking off the network; see Python struct docs)
   - handler function (what we do when this kind of packet arrives)
*************************************************************************/
serverPackets = [
  { // SP_MOTD
    code: 11,
    format: '!bxxx80s',
    handler: function(data) {
        var unpacked = packer.unpack(this.format, data);
        if(unpacked) message = unpacked[1];
        if(net_logging) console.log(message);
        outfitting.motdLine(message);
    }
  },
  { // SP_YOU
    code: 12,
    format: '!bbbbbbxxIlllhhhh',
    handler: function(data) {
        // unpack all the data into variables
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(),   hostile = uvars.shift(),
            swar = uvars.shift(),    armies = uvars.shift(), tractor = uvars.shift(),
            flags = uvars.shift(),   damage = uvars.shift(), shield = uvars.shift(),
            fuel = uvars.shift(),    etemp = uvars.shift(),  wtemp = uvars.shift(),
            whydead = uvars.shift(), whodead = uvars.shift();
        if(net_logging) console.log("SP_YOU pnum=",pnum,"hostile=",team_decode(hostile),"swar=",team_decode(swar),
                    "armies=",armies,"tractor=",tractor,"flags=",flags.toString(2),"damage=",
                    damage,"shield=",shield,"fuel=",fuel,"etemp=",etemp,"wtemp=",
                    wtemp,"whydead=",whydead,"whodead=",whodead);
        if(world.playerNum == null) { world.playerNum = pnum; }
        else {
            world.ships[world.playerNum].handleFlags(flags);
            hud.showEngineTemp(etemp/10);
            if(tutorial.active && (flags & PFORBIT)) { tutorial.handleKeyword("orbit"); }
        }

        if(world.player != null) {
            hud.showFuelLevel(100 * fuel / shipStats[world.player.shipType].fuel);
            hud.showHullLevel(100 * (shipStats[world.player.shipType].hull - damage) / shipStats[world.player.shipType].hull);
            hud.showShieldLevel(100 * shield / shipStats[world.player.shipType].shields);
            hud.showArmies(armies, world.player.kills || 0);
            hud.showMaxSpeed(shipStats[world.player.shipType].speed);

            if(tractor & 0x40) {
                if(world.tractors[pnum] == undefined) {
                    world.addTractor(pnum, new Tractor(pnum, flags));
                }
                world.tractors[pnum].sp_tractor(flags, tractor)
            } else {
                if(world.tractors[pnum] != undefined) {
                    world.removeTractor(pnum);
                }
            }
        }
    }
  },
  { // SP_PL_LOGIN
    code: 24,
    format: "!bbbx16s16s16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), rank = uvars.shift(),
            name = uvars.shift(), monitor = uvars.shift(), login  = uvars.shift();
        if(net_logging) console.log("SP_PL_LOGIN pnum=",pnum,"rank=",rank,"name=",name,"monitor=",monitor,"login=",login)
        playerList.addPlayer(pnum, name, rank);
    }
  },
  { // SP_PING - only received if client sends CP_PING_RESPONSE after SP_LOGIN
    // ...doesn't seem to work
    code: 46,
    format: "!bBHBBBB",

    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), number = uvars.shift(), lag = uvars.shift(),
            tloss_sc = uvars.shift(), tloss_cs = uvars.shift(), iloss_sc  = uvars.shift(),
            iloss_cs = uvars.shift();
        if(net_logging || true) { console.log("SP_PING"); }
        net.send(CP_PING_RESPONSE.data(0, 1, 0, 0));
    }
  },
  { // SP_HOSTILE
    code: 22,
    format: "!bbbb",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), war = uvars.shift(),
            hostile = uvars.shift();
        if(net_logging) console.log("SP_HOSTILE pnum=",pnum,"war=",team_decode(war),"hostile=",team_decode(hostile));
    }
  },
  { // SP_PLAYER_INFO
    code: 2,
    format:"!bbbb",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), shiptype = uvars.shift(), team = team_decode(uvars.shift());
        if(net_logging) console.log("SP_PLAYER_INFO pnum=",pnum,"shiptype=",shiptype,"team=",team);
        var img = imageLib.images[team.length?team[0]:FED][shiptype];
        if(world.ships[pnum] == undefined) {
            world.addShip(pnum, new Ship({
                img: img,
                galImg: imageLib.images[1][shiptype], 
                team:team[0],
                number:pnum.toString(),
                shipType: shiptype
            }));
        }

        world.ships[pnum].setImage(img);
        world.ships[pnum].setTeam(team[0]);
        world.ships[pnum].shipType = shiptype;
     
        playerList.updatePlayer(pnum, team);
    }
  },
  { // SP_KILLS
    code: 3,
    format:"!bbxxI",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), kills = uvars.shift();
        if(net_logging) console.log("SP_KILLS pnum=",pnum,"kills=",kills);
        if(world.ships[pnum]) world.ships[pnum].kills = kills;
        playerList.updatePlayer(pnum, null, kills);
    }
  },
  { // SP_PSTATUS
    code: 20,
    format:"!bbbx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), status = uvars.shift();
        if(net_logging) console.log("SP_PSTATUS pnum=",pnum,"status=",status);
        if(connected_yet && world.player && pnum == world.player.number && status == POUTFIT) {
            world.undraw();
            outfitting.draw(leftCanvas, rightCanvas);
        }
        if(status == PFREE && world.ships[pnum] != undefined) {
            playerList.removePlayer(pnum);
            world.removeShip(pnum);
        }
        else if(status == PALIVE) {
            world.addShip(pnum, world.ships[pnum]);
        }
        else if(status == PEXPLODE) {
            world.ships[pnum].explode();
            world.removeShip(pnum);
        }
    }
  },
  { // SP_PLAYER
    code: 4,
    format:"!bbBbll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), dir = uvars.shift(), speed = uvars.shift(), x = uvars.shift(), y = uvars.shift();
        if(net_logging) console.log("SP_PLAYER pnum=",pnum,"dir=",dir,"speed=",speed,"x=",x,"y=",y);
        world.ships[pnum].setRotation(dir);
        world.ships[pnum].setPosition(x, y);
        world.ships[pnum].speed = speed;

        if(world.player && pnum == world.player.number) {
            hud.showSpeed(speed);

            if(tutorial.active && speed <= 2) {
                // TODO: if near a planet
                for(var i=0; i < world.planets.length; ++i) {
                    var planet = world.planets[i];
                    if((planet.x - x)*(planet.x - x) + (planet.y - y)*(planet.y - y) <= 1600000) {
                        tutorial.handleKeyword("approach")
                    }
                }
            }
        }
    }
  },
  { // SP_FLAGS
    code: 18,
    format:"!bbbxI",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), tractor = uvars.shift(), flags = uvars.shift();
        if(net_logging) console.log("SP_FLAGS pnum=",pnum,"tractor=",tractor,"flags=",flags);

        world.ships[pnum].handleFlags(flags);

        if(tractor & 0x40) {
            if(world.tractors[pnum] == undefined) {
                world.addTractor(pnum, new Tractor(pnum, flags));
            }
            world.tractors[pnum].sp_tractor(flags, tractor);
        } else {
            if(world.tractors[pnum] != undefined) {
                world.removeTractor(pnum);
            }
        }
    }
  },
  { // SP_PLANET_LOC
    code: 26,
    format:"!bbxxll16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), x = uvars.shift(), y = uvars.shift(), name = uvars.shift();
        if(net_logging) console.log("SP_PLANET_LOC pnum=",pnum,"x=",x,"y=",y,"name=",name);
        if(world.planets[pnum] == undefined) {
            world.addPlanet(pnum, new world.Planet(x, y, name, [], world));
        } else {
            world.planets[pnum].setXY(x,y);
        }
    }
  },
  { // SP_LOGIN
    code: 17,
    format:"!bbxxl96s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), accept = uvars.shift(), flags = uvars.shift(), keymap = uvars.shift();
        if(net_logging) console.log("SP_LOGIN accept=",accept,"flags=",flags.toString(2));
        //net.sendArray(CP_PING_RESPONSE.data(0, 1, 0, 0));
    }
  },
  { // SP_MASK
    code: 19,
    format:"!bbxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), mask = uvars.shift();
        if(net_logging) console.log("SP_MASK mask=",team_decode(mask));
        outfitting.applyMask(team_decode(mask))

        // when first connecting, delay showing outfitting until the first SP_MASK is seen
        if(!connected_yet) {
            connected_yet = true;

            $("#overlay").hide();
            $("#login-box").hide();

            outfitting.draw(leftCanvas, rightCanvas);
        }
    }
  },
  { // SP_PICKOK
    code: 16,
    format:"!bbxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), state = uvars.shift();
        if(net_logging) console.log("SP_PICKOK state=", state);
        if(state == 1) {
            outfitting.undraw();
            world.ships[world.playerNum]; 
            world.draw();
            if(tutorial.active) { tutorial.handleKeyword("join"); }
        }
    }
  },
  { // SP_RESERVED
    code: 25,
    format:"!bxxx16s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), data = uvars.shift();
        var text = packer.unpack('16b', data)
        if(net_logging) console.log("SP_RESERVED data=",text);
    }
  },
  { // SP_TORP_INFO
    code: 5,
    format:"!bbbxhxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), war = uvars.shift(), status = uvars.shift(), tnum = uvars.shift();
        if(net_logging) console.log("SP_TORP_INFO war=",team_decode(war)," status=",status," tnum=",tnum);

        if(world.torps[tnum] == undefined && status != TFREE) {
            world.addTorp(tnum, new Torp(-10000, -10000, 0, team_decode(war), world));
        }
        else if(world.torps[tnum] != undefined && status == PTFREE || status == PTEXPLODE || status == PTDET) {

            if(status == PTEXPLODE || status == PTDET) {
                world.torps[tnum].explode();
                world.removeTorp(tnum);
            }

            world.removeTorp(tnum);
        }
    }
  },
  { // SP_TORP
    code: 6,
    format:"!bBhll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), dir = uvars.shift(), tnum = uvars.shift(), x = uvars.shift(), y = uvars.shift();
        if(net_logging) console.log("SP_TORP dir=",dir," tnum=",tnum," x=",x," y=",y);
        if(world.torps[tnum] != undefined) {
            world.torps[tnum].setXYDir(x,y, dir);
        }
    }
  },
  { // SP_PLASMA_INFO
    code: 8,
    format:"!bbbxhxx",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), war = uvars.shift(), status = uvars.shift(), pnum = uvars.shift();
        if(net_logging) console.log("SP_PLASMA_INFO war=",team_decode(war),"status=",status,"pnum=",pnum);
    }
  },
  { // SP_PLASMA
    code: 9,
    format:"!bxhll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), x = uvars.shift(), y = uvars.shift();
        if(net_logging) console.log("SP_PLASMA pnum=",pnum,"x=",x,"y=",y);
    }
  },
  { // SP_STATUS
    code: 14,
    format:"!bbxxIIIIIL",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), tourn = uvars.shift(),
            armsbomb = uvars.shift(), planets = uvars.shift(),
            kills = uvars.shift(), losses = uvars.shift(), time = uvars.shift(),
            timeprod = uvars.shift();
        if(net_logging) console.log("SP_STATUS tourn=",tourn,"armsbomb=",armsbomb,"planets=",planets,"kills=",kills,"losses=",losses,"time=",time,"timepro=",timeprod);
    }
  },
  { // SP_PHASER
    code: 7,
    format:"!bbbBlll",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), status = uvars.shift(), dir = uvars.shift(), x = uvars.shift(), y = uvars.shift(), target = uvars.shift();
        if(net_logging || true) console.log("SP_PHASER pnum=",pnum,"status=",status,"dir=",dir,"x=",x,"y=",y,"target=",target);

        if(status != PHFREE) { world.addPhaser(pnum, new Phaser(world.ships[pnum].x, world.ships[pnum].y, dir, status, target, world)); }
        else { if(world.phasers[pnum] != undefined) world.removePhaser(pnum); }
    }
  },
  { // SP_PLANET
    code: 15,
    format:"!bbbbhxxl",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), owner = uvars.shift(), info = uvars.shift(), flags = uvars.shift(), armies = uvars.shift();
        if(net_logging) console.log("SP_PLANET pnum=",pnum,"owner=",owner,"info=",info,"flags=",flags.toString(2),"armies=",armies);
        world.planets[pnum].applyFlags(flags);
        world.planets[pnum].showArmies(armies);
    }
  },
  { // SP_MESSAGE
    code: 1,
    format:"!bBBB80s",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), m_flags = uvars.shift(),
            m_recpt = uvars.shift(), m_from = uvars.shift(), mesg = uvars.shift();
        if(net_logging) console.log("SP_MESSAGE m_flags=",m_flags.toString(2),"m_recpt=",m_recpt,"m_from=",m_from,"mesg=",mesg);

        // bold the sender/receiver pair of a message
        mesg = mesg.replace(/^(El Nath|Beta Crucis|[^\-]+)->(\S+)/,"<b>$1->$2</b> ")
        $("#inbox").append(mesg + "<br />");
        $("#inbox").scrollTop($("#inbox")[0].scrollHeight);
    }
  },
  { // SP_STATS
    code: 23,
    format:"!bbxx13l",
    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pnum = uvars.shift(), tkills = uvars.shift(),
            tlosses = uvars.shift(), kills = uvars.shift(),
            losses = uvars.shift(), tticks = uvars.shift(),
            tplanets = uvars.shift(), tarmies = uvars.shift(),
            sbkills = uvars.shift(), sblosses = uvars.shift(),
            armies = uvars.shift(), planets = uvars.shift(),
            maxkills = uvars.shift(), sbmaxkills = uvars.shift();
        if(net_logging) console.log("SP_STATS pnum=",pnum, "tkills=",tkills,
                    "tlosses=",tlosses, "kills=",kills, "losses=",losses,
                    "tticks=",tticks, "tplanets=",tplanets, "tarmies=",tarmies,
                    "sbkills=",sbkills, "sblosses=",sblosses, "armies=",armies,
                    "planets=",planets, "maxkills=",maxkills, "sbmaxkills=",
                    sbmaxkills);

        if(world.player != null && pnum == world.player.number) {
            hud.showArmies(armies, kills);
        }

        playerList.updatePlayer(pnum, null, kills);
    }
  },
  { // SP_WARNING
    code: 10,
    format: '!bxxx80s',

    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), message = uvars.shift();
        console.log("SP_WARNING message=", message);
        hud.showWarning(message);
    }
  },
  { // SP_FEATURE
    code: 60,
    format: "!bcbbi80s",

    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), type  = uvars.shift(), arg1 = uvars.shift(),
            arg2 = uvars.shift(), value = uvars.shift(), name = uvars.shift();
        
            if(net_logging) console.log("SP_FEATURE type=%s arg1=%d arg2=%d value=%d name=%s", type, arg1, arg2, value, name);

/*        if (type, arg1, arg2, value, name) == ('S', 0, 0, 1, 'FEATURE_PACKETS'):
            # server says features packets are okay to send,
            # so send this client's features
            if rcd.cp_feature: # we want binary RCDs in SP_MESSAGE packets
                nt.send(cp_feature.data('S', 0, 0, 1, 'RC_DISTRESS'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'SHIP_CAP'))
            nt.send(cp_feature.data('S', 2, 0, 1, 'SP_GENERIC_32'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'TIPS'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'SHOW_ALL_TRACTORS'))

        if name == 'UPS':
            galaxy.ups = value
        # FIXME: process the other feature packets received
*/

        net.sendArray(CP_FEATURE.data('S', 0, 0, 1, 'SHOW_ALL_TRACTORS'));
        //net.sendArray(CP_FEATURE.data('S', 0, 0, 1, 'TIPS'));
    }
  },
  { // SP_QUEUE
    code: 13,
    format: '!bxh',

    handler: function(data) {
        var uvars = packer.unpack(this.format, data);
        var ignored = uvars.shift(), pos = uvars.shift();
        if(net_logging) console.log("SP_QUEUE pos=",pos);
    }
  }
]

// index server packets by code number
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
