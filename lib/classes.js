var Torp = function(placeX, placeY, dir, team, includingWorld) {
    var world_xy = world.netrek2world(placeX, placeY);
    var cir = new Circle(2,
    {
        y: world_xy[0],
        x: world_xy[1],
        fill: imageLib.getRaceColor(team)
    });
    this.x = placeX;
    this.y = placeY;
    this.team = team;
    this.dir = dir;
    this.gfx = cir;
    this.includingWorld = includingWorld;
    this.includingWorld.add(this);
}
Torp.prototype = {

}
