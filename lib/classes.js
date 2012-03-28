
var FUEL=5, REPAIR=6;

var MINTHETA = Math.PI/80;


var Shot = function(placeX, placeY, angle, team, includingWorld) {
    var cir = new Circle(2,
    {
      x: placeX + includingWorld.canvas.width/2 + includingWorld.viewX,
      y: placeY + includingWorld.canvas.height/2 + includingWorld.viewY,
      fill: '#00F'
    });
    this.x = placeX;
    this.y = placeY;
    this.team = team;
    this.angle = (angle + (0.25 - Math.random()/2)) % Math.PI;
    this.gfx = cir;
    this.includingWorld = includingWorld;
    this.includingWorld.add(this);
}

