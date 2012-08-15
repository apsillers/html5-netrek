world = {
    wCanvas: null,       // world canvas
    gCanvas: null,       // galactic canvas
    wGroup: new CanvasNode(),        // world group
    gGroup: new CanvasNode(),        // galactic group
    redrawInterval: null,
    objects: [],         // all objects in the world (which are doubly recorded in the arrays below)
    ships: [],           // array of ships, indexed by ship id
    planets: [],         // array of planets, indexed by planet id
    torps: [],           // array of torps
    stepPeriod: 50,      // time between steps
    stepInterval: null,  // interval identifier, used for clearInterval
    stepListeners: [],   // list of functions called immediately after each step
    viewX: 0,            // logical x/y that is the center of the canvas
    viewY: 0,
    galacticFactor: 200,
    subgalacticFactor: 40,
    playerNum: null,
    player: null,

    init: function(wCanvas, gCanvas) {
        this.wCanvas = wCanvas;
        this.gCanvas = gCanvas;
        this.galacticFactor = 100000 / gCanvas.width;
    },

    draw: function() {
        this.wCanvas.append(this.wGroup);
        this.gCanvas.append(this.gGroup);
        var _self = this;        
        _self.redrawInterval = setInterval(function recenter(){
            var centerX = _self.player.x, centerY = _self.player.y,
                viewBuffer = 150,
                cnvHalfHgt = _self.wCanvas.height / 2 * _self.subgalacticFactor + viewBuffer,
                cnvHalfWid = _self.wCanvas.width / 2 * _self.subgalacticFactor + viewBuffer;

            _self.centerView(_self.player.x, _self.player.y);

            // for all objects in the world
            for(var i = 0; i < _self.objects.length; ++i) {
                var obj = _self.objects[i];
                
                // update display of object in world
                var coords = _self.netrek2world(obj.x, obj.y);
                obj.gfx.x = coords[0];
                obj.gfx.y = coords[1];

                // update display of object in tactical
                if(obj.galGfx) { 
                    var tac_coords = _self.netrek2tac(obj.x, obj.y);
                    obj.galGfx.x = tac_coords[0];
                    obj.galGfx.y = tac_coords[1];
                    obj.galGfx.needMatrixUpdate = true;
                }

                // objects not on canvas shouldn't get drawn
                obj.setOnCanvas(Math.abs(centerX - obj.x) < cnvHalfWid && Math.abs(centerY - obj.y) < cnvHalfHgt);

                // let Cake know this should get redrawn
                obj.gfx.needMatrixUpdate = true;
            }
        }, 100);

        hud.draw();

        // UI: set dest heading via right-click
        $(this.wCanvas.canvas).bind("contextmenu", function setCourseWithRightClick(e) {
            var offset = $(this).offset();
            var offsetX = e.pageX - offset.left;
            var offsetY = e.pageY - offset.top;
            // get the angle
            //_self.player.setRotation(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY)));
            net.sendArray(CP_DIRECTION.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
            e.preventDefault();
        });
        
        // UI: fire torps via left-click
        $(this.wCanvas.canvas).click(function fireTorpWithLeftClick(e) {
            var offset = $(this).offset();
            var offsetX = e.pageX - offset.left;
            var offsetY = e.pageY - offset.top;
            net.sendArray(CP_TORP.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
            e.preventDefault();
        });
        
        //UI: fire phasers via middle-click
        $(this.wCanvas.canvas).mousedown(function firePhasersWithMiddleClick(e) {
            if(e.which==2) {
                var offset = $(this).offset();
                var offsetX = e.pageX - offset.left;
                var offsetY = e.pageY - offset.top;
                net.sendArray(CP_PHASER.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
                e.preventDefault();
            }
        });

        $(document).bind("keyup", function setSpeedWithNumbers(e) {
            // set speed with number keys
            if(e.which >= 48 && e.which <= 57) {
                net.sendArray(CP_SPEED.data(e.which - 48));
                //player.targetSpeed = (e.which - 48) / 2;
            }
        });
    },

    undraw: function() {
        this.wCanvas.removeChild(this.wGroup);
        this.gCanvas.removeChild(this.gGroup);
        hud.undraw();
        clearInterval(this.redrawInterval);
        $(this.wCanvas.canvas).unbind("click", this.fireTorpWithLeftClick);
        $(this.wCanvas.canvas).unbind("contextmenu", this.setCourseWithRightClick);
        $(this.wCanvas.canvas).unbind("mousedown", this.firePhasersWithMIddleClick);
        $(this.wCanvas.canvas).unbind("keyup", this.setSpeedWithNumbers);
    },

    add: function(obj) {
        this.wGroup.append(obj.gfx);
        if(obj.galGfx) this.gGroup.append(obj.galGfx);
        this.objects.push(obj);
    },
    remove: function(obj) {
        this.objects.splice(this.objects.indexOf(obj,1));
        obj.gfx.removeSelf();
        if(obj.galGfx) { obj.galGfx.removeSelf(); }
    },
    addPlanet: function(num, planetObj) {
        this.planets[num] = planetObj;
        this.add(planetObj);
    },
    addShip: function(num, shipObj) {
        this.ships[num] = shipObj;
        if(this.playerNum == num) {
            this.player = shipObj;
        }
        this.add(shipObj);
    },
    addTorp: function(num, torpObj) {
        this.torps[num] = torpObj;
        this.add(torpObj);
    },
    removeTorp: function(num) {
        this.remove(this.torps[num]);
        this.torps[num] = undefined;
    },
    centerView: function(x,y) {
        this.viewX = x;
        this.viewY = y;
    },

    // the world is measured in pixels; netrek returns values in units
    // the subgalacticFactor sets units per pixel
    netrek2world: function(x,y) {
        return [((x - this.viewX) / this.subgalacticFactor) + this.wCanvas.width/2,
                ((y - this.viewY) / this.subgalacticFactor) + this.wCanvas.height/2];
    },

    // the tactical map is measured in pixels; netrek returns values in units
    // the galacticFactor sets units per pixel
    netrek2tac: function(x,y) {
        return [x / this.galacticFactor,
                y / this.galacticFactor];
    },
    
    byte2rad: function(byteRot) {
        return byteRot / 255 * Math.PI*2;
    },

    rad2byte: function(rad) {
        if(rad < 0)
            rad = 2 * Math.PI + rad;

        return Math.floor(rad * 255/(Math.PI*2));
    },

    getAngleFromCenter: function(offsetX, offsetY) {
        //normalize to canvas cartesian coords
        var carteX = offsetX - this.wCanvas.width/2;
        var carteY = this.wCanvas.height/2 - offsetY;
        var angle = Math.atan(carteX/carteY);
        // if the click was in a lower quadrent, augment the atan value
        if(carteY<0) {
            angle *= -1;
            if(carteX>0) angle = Math.PI - angle;
            else         angle = -Math.PI - angle;
        }

        return angle;
    },

    Planet: function(placeX, placeY, name, features, includingWorld) {
        var world_xy = world.netrek2world(placeX, placeY);
        var cir = new Circle(18,
        {
            y: world_xy[0],
            x: world_xy[1],
            fill: 'none',
            stroke: '#FF0'
        });
        var text = new TextNode(name.replace(/\x00/g,""),
                                {y:cir.radius+15, textAlign:"center",
                                 fill:'yellow', scale:1.2,
                                 font:"bold 9px courier"});
        cir.append(text);
        
        if(features.indexOf(this.FUEL)!=-1) {
            var tank = new Polygon([0,0,5,0,8,2,8,13,0,13], {x:cir.radius-12,y:-7});
            tank.append(new Polygon([2,3,5,6]));
            tank.append(new Polygon([2,6,5,3]));
            cir.append(tank);
        }
        //if(this.REPAIR in features) {
            //TODO: draw wrench
        //}
        
        this.x = placeX;
        this.y = placeY;
        this.gfx = cir;

        var tac_xy = world.netrek2tac(placeX, placeY);
        this.galGfx = new Circle(this.radius,
        {
            y: tac_xy[0],
            x: tac_xy[1],
            stroke: "#FF0",
            radius: 5,
            zIndex:1
        });

        this.includingWorld = includingWorld;
        //this.includingWorld.addPlanet(this);
        this.gfxRoot = world.wGroup;
        this.isOnCanvas = true;
    }
}
world.Planet.prototype = {
    FUEL:0,
    REPAIR:1,
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
