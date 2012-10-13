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

    this.isOnCanvas = true;

    if(typeof options.gfx != "object") {
        var world_xy = world.netrek2world(options.x, options.y);
        this.gfx = new Circle(this.radius,
        {
            y: world_xy[0] + options.img.height/2,
            x: world_xy[1] + options.img.width/2,
            stroke: teamLib.getRaceColor(options.team),
            strokeWidth: 1,
            fill: 'none',
            radius: 12,
            zIndex:10000000
        });
        this.gfx.append(new ImageNode(options.img,
        {
          x: 0,
          y: 0,
          centered: true,
          stroke: 'none',
          zIndex: -1
        }));
    } else {
        this.gfx = options.gfx;
    }
    this.gfx.append(new TextNode(this.number, {
        x: 15,
        y: -3,
        fill: teamLib.getRaceColor(options.team)
    }));

    if(typeof options.galGfx != "object") {
        var tac_xy = world.netrek2tac(options.x, options.y);
        this.galGfx = new TextNode(this.number,
        {
            y: tac_xy[0],
            x: tac_xy[1],
            fill: teamLib.getRaceColor(options.team),
            font:"bold 13px courier",
            zIndex:10000000
        })
    } else {
        this.gfx = options.gfx;
    }

    this.includingWorld = options.world;
    this.gfxRoot = world.wGroup;

    /*this.gfx.addFrameListener(function() {
        var viewBuffer = 150,
            cnvHalfHgt = world.wCanvas.height / 2 * world.subgalacticFactor + viewBuffer,
            cnvHalfWid = world.wCanvas.width / 2 * world.subgalacticFactor + viewBuffer;

        var coords = world.netrek2world(_self.x, _self.y);
        _self.gfx.x = coords[0];
        _self.gfx.y = coords[1];

        // update display of Object in tactical
        if(_self.galGfx) {
            var tac_coords = world.netrek2tac(_self.x, _self.y);
            _self.galGfx.x = tac_coords[0];
            _self.galGfx.y = tac_coords[1];
        }
        if(_self == world.player) console.log(world.viewY, _self.y, world.viewY - _self.y);
    });*/
}
Ship.prototype = {
    setPosition: function(x,y) {
        this.x = x;
        this.y = y;
    },
    
    // convert 0-255 rotation to radians and set
    setRotation: function(byteRot) {
        var rads = Math.PI*2 * byteRot/255;
        this.gfx.childNodes[0].rotation = [rads,0,0];
        this.gfx.childNodes[0].changed = true;
        this.gfx.changed = true;
    },

    setImage: function(img) {
        this.gfx.childNodes[0].image = img;
        this.gfx.changed = true;
    },

    setTeam: function(team) {
        this.team = team;
        this.galGfx.fill = teamLib.getRaceColor(team);
        this.galGfx.changed = true;
    },

    setVisible: function(isVis) {
        this.gfx.visible = isVis;
        this.gfx.changed = true;

        this.galGfx.fill = isVis?teamLib.getRaceColor(this.team):"#666";
        this.galGfx.text = isVis?this.number:"?";
        this.galGfx.changed = true;

        this.cloaked = !isVis;
    },

    setShields: function(shieldsUp) {
        this.gfx.stroke = shieldsUp?teamLib.getRaceColor(this.team):"none";
        this.gfx.changed = true;

        this.shields = shieldsUp;
    },

    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.append(this.gfx);
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

        if(this === world.player) {
            if(this.orbitting) { hud.showSpeedPointer(0); }
        }
    }
}
