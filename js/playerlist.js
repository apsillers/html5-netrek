playerList = {
    list: [],
    listDiv: null,
    init: function(listDiv) {
        this.listDiv = listDiv;
    },
    update: function() {
        var table = document.createElement("table");
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>Num</td><td>Name</td><td>Rank</td><td>Team</td><td>kills</td>";
        table.appendChild(tr);

        for(var i=0; i<this.list.length; ++i) {
            if(this.list[i]) {
                var item = this.list[i];
                tr = document.createElement("tr");
                var fields = ["pnum", "name", "rank", "team", "kills"]
                for(var j=0; j<fields.length; ++j) {
                    var td = document.createElement("td");
                    td.appendChild(document.createTextNode(item[fields[j]]));
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
        }
        this.listDiv.replaceChild(table, this.listDiv.firstElementChild);
    },
    addPlayer: function(pnum, name, rank) {
        this.list[pnum] = {
            pnum: pnum,
            name: name,
            rank: rank,
            team: "--",
            kills: "--"
        }
        this.update();
    },
    removePlayer: function(pnum) {
        delete this.list[pnum];
        this.update();
    },
    updatePlayer: function(pnum, team, kills) {
        this.list[pnum].team = team||this.list[pnum].team||"--";
        this.list[pnum].kills = kills||"--";
        this.update();
    }
}
