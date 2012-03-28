IND=0x0, ROM=0x1, FED=0x2, KLI=0x4, ORI=0x8;
var imageLib = {
    ships: ["SC","DD","CA","BB","AS","SB"],
    races: ["Rom", "Fed", "Kli", "Ori"],
    raceIds: [ROM, FED, KLI, ORI],

    images:[],

    loadAll: function() {
        for(var i = 0; i < this.races.length; ++i) {
            this.images[this.raceIds[i]] = [];
            for(var j = 0; j < this.ships.length; ++j) {
                var img = new Image();
                this.images[this.raceIds[i]][j] = img;
                img.src = "/data/img/"+this.races[i]+"/"+this.ships[j]+"0.png";
            }
        }
    }

}
