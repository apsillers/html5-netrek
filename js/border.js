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
var Border = function(options) {
    this.x = options.x;
    this.y = options.y;
	this.gfx = new PIXI.Graphics();
    this.gfx.lineStyle(2, 0xFFFFFF, 1).moveTo(0, 0);
	this.gfx.lineTo(options.width / world.subgalacticFactor, options.height / world.subgalacticFactor);
    world.add(this);
}
Border.prototype = {
    setOnCanvas: function(setOn) {
        return;
    }
}
