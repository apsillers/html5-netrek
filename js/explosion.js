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
var Explosion = function(options) {
    if(options == undefined) options = {};

    var self = this;

    this.x = options.x || 0;
    this.y = options.y || 0;
    this.radius = options.radius || 0;
    this.gfx = new PIXI.Graphics().lineStyle(2,0xFF0000,1).beginFill(0xffa500).drawCircle(0, 0, this.radius);

    world.add(this);

    this.growInterval = setInterval(function () {
        self.radius += (options.radiusStep || 0.5);
		this.gfx = new PIXI.Graphics().lineStyle(2,0xFF0000,1).beginFill(0xffa500).drawCircle(0, 0, this.radius);
        if(self.radius > (options.maxRadius || 8)) {
            world.remove(self);
            clearInterval(self.growInterval);
        }
    }, 100);
}
Explosion.prototype = {
    setOnCanvas: function(setOn) {
        return;
    }
}
