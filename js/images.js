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
var imageLib = {
    ships: ["SC","DD","CA","BB","AS","SB"],
    races: ["Rom", "Kli", "Ori", "Fed"],
    raceIds: [ROM, KLI, ORI, FED],
	shipIds: [SC,DD,CA,BB,AS,SB],

    images:[],

    // load all images and fire callback
    loadAll: function(callback) {
        for(var i = 0; i < this.races.length; ++i) {
            for(var j = 0; j < this.ships.length; ++j) {
                PIXI.loader.add(this.raceIds[i]+":"+this.shipIds[j], "data/img/"+this.races[i]+"/"+this.ships[j]+"0.png");
				//console.log(this.raceIds[i]+":"+this.shipIds[j], "data/img/"+this.races[i]+"/"+this.ships[j]+"0.png");
            }
        }
		PIXI.loader.load(callback);
    },
	
	getTexture: function(raceNum, shipNum) {
		return PIXI.loader.resources[raceNum+":"+shipNum].texture;
	}
}
