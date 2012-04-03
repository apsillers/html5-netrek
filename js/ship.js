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

    this.number = options.number;

    this.team = options.team;
    this.radius = options.radius || 12;
    this.heading = options.heading || 0;
    this.omega = options.omega || 0;
    this.speed = options.speed || 0;
    this.targetHeading = options.targetHeading || null;
    this.targetSpeed = options.targetSpeed || 0;

    this.isOnCanvas = true;

    if(typeof options.gfx != "object") {
        var world_xy = world.netrek2world(options.x, options.y);
        this.gfx = new Circle(this.radius,
        {
            y: world_xy[0] + options.img.height/2,
            x: world_xy[1] + options.img.width/2,
            stroke: teamLib.getRaceColor(options.team),
            strokeWidth: 1,
            fill: 'none',
            radius: 12,
            zIndex:10000000
        });
        this.gfx.append(new ImageNode(options.img,
        {
          x: 0,
          y: 0,
          centered: true,
          stroke: 'none',
          zIndex: -1
        }));
    } else {
        this.gfx = options.gfx;
    }
    this.gfx.append(new TextNode(this.number, {
        x: 15,
        y: -3,
        fill: teamLib.getRaceColor(options.team),
        font: "bold"
    }));

    if(typeof options.galGfx != "object") {
        var tac_xy = world.netrek2tac(options.x, options.y);
        this.galGfx = new Circle(this.radius,
        {
            y: tac_xy[0],
            x: tac_xy[1],
            fill: teamLib.getRaceColor(options.team),
            radius: 4,
            zIndex:10000000
        })
    } else {
        this.gfx = options.gfx;
    }

    this.includingWorld = options.world;
    this.gfxRoot = world.wGroup;
}
Ship.prototype = {
    setPosition: function(x,y) {
        this.x = x;
        this.y = y;
    },
    
    // convert 0-255 rotation to radians and set
    setRotation: function(byteRot) {
        var rads = Math.PI*2 * byteRot/255;
        this.gfx.childNodes[0].rotation = [rads,0,0];
    },

    setImage: function(img) {
        this.gfx.childNodes[0].image = img;
    },

    setTeam: function(team) {
        this.team = team;
        this.galGfx.fill = teamLib.getRaceColor(team);
    },

    setVisible: function(isVis) {
        if(isVis) {
            
        } else {

        }
    },

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
