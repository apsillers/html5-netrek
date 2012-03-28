var imageLib = {
    ships: ["SC","DD","CA","BB","AS","SB"],
    races: ["Fed", "Rom", "Kli", "Ori"],

    images:[],

    loadAll: function() {
        for(var i = 0; i < this.races.length; ++i) {
            this.images[i] = [];
            for(var j = 0; j < this.ships.length; ++j) {
                var img = new Image();
                this.images[i][j] = img;
                img.src = "/data/img/"+this.races[i]+"/"+this.ships[j]+"0.png";
            }
        }
    }

}
