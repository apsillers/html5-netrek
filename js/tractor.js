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



    The Tractor class is a model of a tractor or pressor that updates the its
    appearance and location in the tactical view.
*/
var Tractor = function(pnum) {
    this.actor = world.ships[pnum];

    this.x = this.actor.x;
    this.y = this.actor.y;

    this.gfx = new Line(0,0,0,0, {zIndex:-100});

    this.includingWorld = world;
    this.gfxRoot = world.wGroup;
    this.isOnCanvas = true;
}
Tractor.prototype = {
    sp_tractor: function(flags, targetNum) {
        this.target = world.ships[targetNum & ~0x40];
        this.flags = flags;

        this.x = this.actor.x;
        this.y = this.actor.y;

        var coords = world.netrek2world(this.x, this.y);
        var coords2 = world.netrek2world(this.target.x, this.target.y);

        this.gfx.x2 = coords2[0] - coords[0];
        this.gfx.y2 = coords2[1] - coords[1];
        this.gfx.strokeWidth = 5;
        this.gfx.stroke = flags & PFPRESS ? "purple":"green";
        this.gfx.changed = true;
    },

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
