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

*/
var Torp = function(placeX, placeY, dir, team, includingWorld) {
    var self = this;
    var world_xy = world.netrek2world(placeX, placeY);
    var cir = new Circle(2,
    {
        y: world_xy[0],
        x: world_xy[1],
        fill: team.indexOf(includingWorld.player.team)?"#FFF":"#FF0"//teamLib.getRaceColor(team)

    });


    this.x = placeX;
    this.y = placeY;
    this.team = team;
    this.dir = dir;
    this.gfx = cir;
    this.includingWorld = includingWorld;
    this.gfxRoot = world.wGroup;
    this.isOnCanvas = true;
    //this.boundRedraw = function() { self.redrawSelf(); };

    //this.redrawInterval = setInterval(this.boundRedraw, 150);
}
Torp.prototype = {
    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.append(this.gfx);
            this.isOnCanvas = true;
        } else if(!setOn && this.isOnCanvas) {
            this.gfx.removeSelf();
            this.isOnCanvas = false;
        }
    },

    setXYDir: function(placeX, placeY, dir) {
        this.x = placeX;
        this.y = placeY;
        this.dir = dir;
        this.gfx.fill = "white";
        //clearInterval(this.redrawInterval);
        //this.redrawInterval = setInterval(this.boundRedraw, 150);
    }/*,

    redrawSelf: function() {
        var radDir = world.byte2rad(this.dir);
        var dx = 12 * Math.cos(radDir);
        var dy = 12 * Math.sin(radDir);
        this.x -= 10;
        this.y -= 10;
    }*/
}
