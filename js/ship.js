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



    The Ship class is a model of a ship that update the ship's appearance
    and location in the galactic and tactical views.
    All Ship objects are registered in an array in the World singleton, where
    they are used for re-drawing and ID-indexed access (world.ships[i]).
*/
var Ship = function(options) {
    if(options == undefined) options = {};

    var _self = this;

    this.x = options.x || 0;
    this.y = options.y || 0;

    this.number = options.number;

    this.team = options.team;
    this.radius = options.radius || 12;
    this.heading = options.heading || 0;
    this.omega = options.omega || 0;
    this.speed = options.speed || 0;
    this.targetHeading = options.targetHeading || null;
    this.targetSpeed = options.targetSpeed || 0;
    this.cloaked = false;
    this.shields = true;
    this.orbitting = false;
    this.shipType = options.shipType;

    this.isOnCanvas = true;

    if(typeof options.gfx != "object") {
        var world_xy = world.netrek2world(options.x, options.y);
		this.gfx = new PIXI.Container();
		this.shieldsGfx = new PIXI.Graphics().lineStyle(1,teamLib.getRaceColor(options.team),1).drawCircle(0, 0, 12);
		this.gfx.addChild(this.shieldsGfx);
		this.gfx.position.set(world_xy[1], world_xy[0]);
		
        this.setImage(options.img);
        this.gfx.addChild(this.hullGfx);
    } else {
        this.gfx = options.gfx;
    }
    this.numberGfx = new PIXI.Text(this.number, { fill: teamLib.getRaceColor(options.team), fontSize:"9pt" });
	this.numberGfx.position.set(15, 0);
    this.gfx.addChild(this.numberGfx);

    if(typeof options.galGfx != "object") {
        var tac_xy = world.netrek2tac(options.x, options.y);
		this.galGfx = new PIXI.Text(this.number, { fill: teamLib.getRaceColor(options.team), fontWeight:"bold", fontSize:"20px", fontFamily:"courier" });
        this.galGfx.position.set(tac_xy[0], tac_xy[1]);
        
    } else {
        this.gfx = options.gfx;
    }

    this.includingWorld = options.world;
    this.gfxRoot = world.wGroup;

    this.hullGfx.on("click", function() {
        if(world.tractorCursor) {
            if(world.isPressor) {
                net.sendArray(CP_REPRESS.data(1, parseInt(_self.number)));
            } else {
                net.sendArray(CP_TRACTOR.data(1, parseInt(_self.number)));
            }
            world.setTractorCursor(false);
        }
    });
}
Ship.prototype = {
    setPosition: function(x,y) {
        this.x = x;
        this.y = y;
    },
    
    // convert 0-255 rotation to radians and set
    setRotation: function(byteRot) {
        var rads = Math.PI*2 * byteRot/255;
        this.hullGfx.rotation = rads;
    },

    setImage: function(img) {
        if(this.hullGfx) { this.gfx.removeChild(this.hullGfx); }
        this.hullGfx = new PIXI.Sprite(img);
		this.hullGfx.pivot.set(this.hullGfx.width/2, this.hullGfx.height/2);
        this.gfx.addChild(this.hullGfx);
    },

    setTeam: function(team) {
        this.team = team;
        
        this.numberGfx.fill = teamLib.getRaceColor(team);
        this.numberGfx.changed = true;

        this.galGfx.fill = teamLib.getRaceColor(team);
        this.galGfx.changed = true;
    },

    setVisible: function(isVis) {
        this.gfx.visible = isVis;
        //this.gfx.changed = true;

        this.galGfx.fill = isVis?teamLib.getRaceColor(this.team):"#666";
        this.galGfx.text = isVis?this.number:"?";
        //this.galGfx.changed = true;

        this.cloaked = !isVis;
    },

    setShields: function(shieldsUp) {
        this.shieldsGfx.alpha = shieldsUp?1:0;

        this.shields = shieldsUp;
    },

    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.addChild(this.gfx);
            this.isOnCanvas = true;
        } else if(!setOn && this.isOnCanvas) {
            this.gfx.removeSelf();
            this.isOnCanvas = false;
        }
    },

    handleFlags: function(flags) {
        //console.log(flags.toString(2))
        this.setShields(flags & PFSHIELD);
        this.setVisible(!(flags & PFCLOAK));
        this.orbitting = flags & PFORBIT;
        this.bombing = flags & PFBOMB;
        this.repairing = flags & PFREPAIR;
        this.tractoring = flags & PFTRACT && !(flags & PFPRESS);
        this.pressing = flags & PFPRESS;

        if(this === world.player) {
            if(this.orbitting || this.repairing) { hud.showSpeedPointer(0); }
            hud.setShieldIndic(this.shields);
            hud.setCloakIndic(this.cloaked);
            hud.setRepairIndic(this.repairing);
            hud.setOrbitIndic(this.orbitting);
            hud.setBombIndic(this.bombing);
            hud.setTractorIndic(this.tractoring);
            hud.setPressorIndic(this.pressing);
        }
    },

    explode: function() {
        new Explosion({x: this.x, y: this.y, radius: 0, maxRadius: 8, radiusStep: 0.7});
    }
}
