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
Phaser = function(placeX, placeY, dir, status, target, includingWorld) {
    var self = this;
    this.x = placeX;
    this.y = placeY;
    var world_xy = world.netrek2world(this.x, this.y);
    this.dir = dir;

//alert(target);
    if(status == PHHIT) {
        var shipHit = world.ships[target];
        //var shipCoords = world.netrek2world(shipHit.x, shipHit.y);
        var destX = shipHit.gfx.x - world_xy[0];
        var destY = shipHit.gfx.y - world_xy[1];
    } else if(status == PHHIT2) {
        // TODO: implement plasmas
        /*var plasmaHit = world.plasmas[target];
        var destX = plasmaHit.x - placeX;
        var destY = plasmaHit.y - placeY;*/
    } else {
        var radDir = world.byte2rad(this.dir);
        var destX = 100 * Math.sin(radDir);
        var destY = 100 * -Math.cos(radDir);
    }

    var line = new Line(0, 0, destX, destY,
    {
        y: world_xy[0],
        x: world_xy[1],
        fill: status==PHHIT?"#F00":"#FFF",
        stroke: status==PHHIT?"#F00":"#FFF"
    });

    this.gfx = line;
    this.includingWorld = includingWorld;
    this.gfxRoot = world.wGroup;
    this.isOnCanvas = true;
}
Phaser.prototype = {
    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.append(this.gfx);
            this.isOnCanvas = true;
        } else if(!setOn && this.isOnCanvas) {
            this.gfx.removeSelf();
            this.isOnCanvas = false;
        }
    }
}
