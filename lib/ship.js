/*
    The Ship class is a model of a ship that update the ship's appearance
    and location in the galactic and tactical views.
    All Ship objects are registered in an array in the World singleton, where
    they are used for re-drawing and ID-indexed access (world.ships[i]).
*/
var Ship = function(options) {
    if(options == undefined) options = {};

    this.x = options.x || 0;
    this.y = options.y || 0;

    this.team = options.team;
    this.radius = options.radius || 12;
    this.heading = options.heading || 0;
    this.omega = options.omega || 0;
    this.speed = options.speed || 0;
    this.targetHeading = options.targetHeading || null;
    this.targetSpeed = options.targetSpeed || 0;

    if(typeof options.gfx != "object") {
        this.gfx = new Circle(this.radius,
        {
            y: options.img.height/2,
            x: options.img.width/2,
            stroke: '#0F0',
            strokeWidth: 1,
            fill: 'none',
            zIndex:10000000
        })
        this.gfx.append(new ImageNode(options.img,
        {
          x: -options.img.width/2,
          y: -options.img.height/2,
          stroke: 'none'
        }));
    } else {
        this.gfx = options.gfx;
    }

    if(typeof options.galGfx != "object") {
        this.gfx = new Circle(this.radius,
        {
            y: -options.galImg.height/2,
            x: -options.galImg.width/2,
            zIndex:10000000
        })
        this.gfx.append(new ImageNode(options.img,
        {
          x: -options.img.width/2,
          y: -options.img.height/2,
          stroke: 'none'
        }));
    } else {
        this.gfx = options.gfx;
    }

    this.includingWorld = options.world;
    if(this.includingWorld) { this.includingWorld.add(this); }
}
Ship.prototype = {
    setPosition: function(x,y) {
        this.gfx.x = world.netrek2world(x);
        this.gfx.y = world.netrek2world(y);
        this.x = x;
        this.y = y;
    },
    
    // convert 0-255 rotation to radians and set
    setRotation: function(byte) {
        var rads = Math.PI*2 * byte/255;
        this.gfx.rotation = [rads,0,0];
    },

    setVisible: function(isVis) {
        if(isVis) {
            
        } else {

        }
    }
}
