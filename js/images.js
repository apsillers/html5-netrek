IND=0x0, ROM=0x1, KLI=0x2, ORI=0x4, FED=0x8;
var imageLib = {
    ships: ["SC","DD","CA","BB","AS","SB"],
    races: ["Rom", "Kli", "Ori", "Fed"],
    raceIds: [ROM, KLI, ORI, FED],

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
    },

    getRaceColor: function(race, light) {
        if(race == FED) return light?"#330":"#FF0";
        if(race == KLI) return light?"#030":"#0F0";
        if(race == ROM) return light?"#300":"#F00";
        if(race == ORI) return light?"#003":"#00F";
        return "#FFF";
    }
}
