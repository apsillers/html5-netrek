var Torp = function(placeX, placeY, dir, team, includingWorld) {
    var world_xy = world.netrek2world(placeX, placeY);
    var cir = new Circle(2,
    {
        y: world_xy[0],
        x: world_xy[1],
        fill: teamLib.getRaceColor(team)

    });
    this.x = placeX;
    this.y = placeY;
    this.team = team;
    this.dir = dir;
    this.gfx = cir;
    this.includingWorld = includingWorld;
    this.gfxRoot = world.wGroup;
    this.isOnCanvas = true;
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
    }
}
