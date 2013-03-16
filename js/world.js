/*
    Copyright (C) 2012 Andrew P. Sillers (apsillers@gmail.com)

    This file is part of the HTML5 Netrek Client.

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/
world = {
    wCanvas: null,       // world canvas
    gCanvas: null,       // galactic canvas
    wGroup: new CanvasNode(),        // world group
    gGroup: new CanvasNode(),        // galactic group
    planetGroup: new CanvasNode(),
    redrawInterval: null,
    objects: [],         // all objects in the world (which are doubly recorded in the arrays below)
    ships: [],           // array of ships, indexed by ship id
    planets: [],         // array of planets, indexed by planet id
    torps: [],           // array of torps
    phasers: [],         // array of phasers
    tractors: [],        // array of tractors
    stepPeriod: 50,      // time between steps
    stepInterval: null,  // interval identifier, used for clearInterval
    stepListeners: [],   // list of functions called immediately after each step
    viewX: 0,            // logical x/y that is the center of the canvas
    viewY: 0,
    galacticFactor: 200,
    subgalacticFactor: 40,
    galaticXOffset: 0,
    playerNum: null,
    player: null,
    drawn: false,
    tractorCursor: false, // is the next click to use tractor
    isPressor: false,     // when tractorCursor is true: pressor or tractor
    directing: false,     // is the touch-directional UI up
    directingAngle: 0,    // last directed angle (in radians)

    setTractorCursor: function(cursor, pressor) {
        this.tractorCursor = cursor;
        this.isPressor = pressor;
        this.wCanvas.cursor = cursor?"crosshair":"default";
    },

    showDirecting: function(directing) {
        this.directing = directing;
        hud.showDirectionWheel(directing);
    },

    init: function(wCanvas, gCanvas) {
        this.wCanvas = wCanvas;
        this.gCanvas = gCanvas;
        this.galacticFactor = 100000 / gCanvas.height;
        this.galaticXOffset = gCanvas.width - gCanvas.height - 0;

        new Border({x:0, y:0, width: 100000, height: 0})
        new Border({x:0, y:0, width: 0, height: 100000})
        new Border({x:100000, y:0, width: 0, height: 100000})
        new Border({x:0, y:100000, width: 100000, height: 0})
    },

    draw: function() {
        this.wCanvas.append(this.wGroup);
        this.gCanvas.append(this.gGroup);
        this.wGroup.append(this.planetGroup);
        var _self = this;
        _self.redrawInterval = setInterval(function recenter(){

            var debugStr = _self.objects.length+"<br/>";

            var centerX = _self.player.x, centerY = _self.player.y,
                viewBuffer = 150,
                cnvHalfHgt = _self.wCanvas.canvas.height / 2 * _self.subgalacticFactor + viewBuffer,
                cnvHalfWid = _self.wCanvas.canvas.width / 2 * _self.subgalacticFactor + viewBuffer;

            _self.centerView(_self.player.x, _self.player.y);

            // for all objects in the world
            for(var i = 0; i < _self.objects.length; ++i) {

                var obj = _self.objects[i];

                // update display of object in world
                var coords = _self.netrek2world(obj.x, obj.y);
                obj.gfx.x = coords[0];
                obj.gfx.y = coords[1];

                //if(obj instanceof Phaser) { debugStr+="Phaser</br>"; console.log(obj.gfx); }

                // update display of object in tactical
                if(obj.galGfx) { 
                    var tac_coords = _self.netrek2tac(obj.x, obj.y);
                    obj.galGfx.x = tac_coords[0];
                    obj.galGfx.y = tac_coords[1];
                    obj.galGfx.changed = true;
                }

                // objects not on canvas shouldn't get drawn
                obj.setOnCanvas(Math.abs(centerX - obj.x) < cnvHalfWid && Math.abs(centerY - obj.y) < cnvHalfHgt);

                // let Cake know this should get redrawn
                obj.gfx.changed = true;
            }

            //$("#debug").html(debugStr);
        }, REDRAW_RATE);

        hud.draw();

        // UI: set dest heading via right-click
        $(this.wCanvas.canvas).bind("contextmenu", _self.setCourseWithRightClick = function (e) {
            var offset = $(this).offset();
            var offsetX = e.pageX - offset.left;
            var offsetY = e.pageY - offset.top;
            // get the angle
            net.sendArray(CP_DIRECTION.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
            e.preventDefault();
        });
        
        // UI: fire torps via left-click
        $(this.wCanvas.canvas).click(function fireTorpWithLeftClick(e) {
            if(!_self.tractorCursor) {
                var offset = $(this).offset();
                var offsetX = e.pageX - offset.left;
                var offsetY = e.pageY - offset.top;

                if(!("ontouchstart" in document)) {
                    if(!e.shiftKey) {
                        // maybe this click was intended for a UI element, which may cancel the torp fire
                        _self.torpFireTimeout = setTimeout(function() { net.sendArray(CP_TORP.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY)))); }, 4);
                    } else {
                        net.sendArray(CP_PHASER.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
                    }
                }
            } else {
                setTimeout(function(){ _self.setTractorCursor(false) }, 100);
            }
            e.preventDefault();
        });

        // UI: fire phasers via middle-click
        $(this.wCanvas.canvas).mousedown(function firePhasersWithMiddleClick(e) {
            if(e.which==2) {
                var offset = $(this).offset();
                var offsetX = e.pageX - offset.left;
                var offsetY = e.pageY - offset.top;
                net.sendArray(CP_PHASER.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
                e.preventDefault();
            }
        });

        $(document).bind("keyup", function handleKeys(e) {
            if(chat.chatting || chat.choosing) { return true; } 

            // set speed with number keys
            if(e.which >= 48 && e.which <= 57) {
                var speed = e.which - 48;
                net.sendArray(CP_SPEED.data(speed));
                hud.showSpeedPointer(speed);
                e.preventDefault();
            } else {
                if(e.keyCode == 67) {
                    net.sendArray(CP_CLOAK.data(_self.player.cloaked?0:1));
                    e.preventDefault();
                } else if(e.keyCode == 82 && e.shiftKey) { // R - repair
                    net.sendArray(CP_REPAIR.data(1));
                    e.preventDefault();
                } else if(e.keyCode == 83) { // s - toggle shields
                    net.sendArray(CP_SHIELD.data(_self.player.shields?0:1));
                    e.preventDefault();
                } else if(e.keyCode == 79) { // o - orbit planet
                    net.sendArray(CP_ORBIT.data(_self.player.orbitting?0:1));
                    e.preventDefault();
                } else if(e.keyCode == 66) { // b bomb planet
                    net.sendArray(CP_BOMB.data(_self.player.bombing?0:1));
                    e.preventDefault();
                } else if(e.keyCode == 68  && !e.shiftKey) { // d - det enemy torps
                    net.sendArray(CP_DET_TORPS.data());
                    e.preventDefault();
                } else if(e.keyCode == 68 && e.shiftKey) { // d - det all of the player's torps
                    var baseTorpIndex = _self.player.number * 8;
                    for(var i=0; i < 8; ++i) {
                        net.sendArray(CP_DET_MYTORP.data(baseTorpIndex + i));
                    }
                    e.preventDefault();
                } else if(e.keyCode == 88) { // x - beam down
                    net.sendArray(CP_BEAM.data(2));
                    e.preventDefault();
                } else if(e.keyCode == 90) { // z - beam up
                    net.sendArray(CP_BEAM.data(1));
                    e.preventDefault();
                } else if(e.keyCode == 89) { // y - pressor
                    if(!_self.tractorCursor || (_self.tractorCursor && !_self.isPressor)) {
                        if(!_self.player.pressing) { _self.setTractorCursor(true, true); }
                        else { net.sendArray(CP_TRACTOR.data(0,0)); }
                    }
                    else {
                        _self.setTractorCursor(false);
                    }
                } else if(e.keyCode == 84  && e.shiftKey) { // T - tractor
                    if(!_self.tractorCursor || (_self.tractorCursor && _self.isPressor)) {
                        if(!_self.player.tractoring) { _self.setTractorCursor(true, false); }
                        else { net.sendArray(CP_TRACTOR.data(0,0)); }
                    }
                    else {
                        _self.setTractorCursor(false);
                    }
                }
            }
        });

        $(this.wCanvas.canvas).bind("touchstart", function(e) {
            if(!_self.tractorCursor && !_self.directing) {
                var offset = $(this).offset();
                var offsetX = e.targetTouches[0].pageX - offset.left;
                var offsetY = e.targetTouches[0].pageY - offset.top;
                if(Math.abs(offsetX - parseInt(this.width) / 2) < 20 &&
                   Math.abs(offsetY - parseInt(this.height) / 2) < 20) {
                    _self.showDirecting(true);
                }
            }
        });

        $(this.wCanvas.canvas).bind("touchmove", function(e) {
            if(_self.directing) {
                var offset = $(this).offset();
                var offsetX = e.targetTouches[0].pageX - offset.left;
                var offsetY = e.targetTouches[0].pageY - offset.top;
                _self.directingAngle = _self.getAngleFromCenter(offsetX, offsetY);
                hud.showDirectionAngle(_self.directingAngle);
                e.preventDefault();
            }
        });

        $(this.wCanvas.canvas).bind("touchend", function(e) {
            if(_self.directing) {
                net.sendArray(CP_DIRECTION.data(_self.rad2byte(_self.directingAngle)));
                _self.showDirecting(false);
            } else {
                var offset = $(this).offset();
                var offsetX = e.changedTouches[0].pageX - offset.left;
                var offsetY = e.changedTouches[0].pageY - offset.top;
                _self.torpFireTimeout = setTimeout(function() { net.sendArray(CP_TORP.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY)))); }, 4);
            }
        });

        gamepad.startReading();

        this.drawn = true;
    },

    undraw: function() {
        this.wCanvas.removeChild(this.wGroup);
        this.gCanvas.removeChild(this.gGroup);
        hud.undraw();
        clearInterval(this.redrawInterval);
        $(this.wCanvas.canvas).unbind("click", this.fireTorpWithLeftClick);
        $(this.wCanvas.canvas).unbind("contextmenu", this.setCourseWithRightClick);
        $(this.wCanvas.canvas).unbind("mousedown", this.firePhasersWithMIddleClick);
        $(this.wCanvas.canvas).unbind("keyup", this.handleKeys);

        $(this.wCanvas.canvas).unbind("touchstart", this.startDirectingOnTouch);
        $(this.wCanvas.canvas).unbind("touchmove", this.changeDirectingOnMove);
        $(this.wCanvas.canvas).unbind("touchend", this.sendDirectionOnEnd);

        gamepad.stopReading();

        this.drawn = false;
    },

    add: function(obj) {
        this.wGroup.append(obj.gfx);

        if(obj.galGfx) this.gGroup.append(obj.galGfx);
        this.objects.push(obj);
    },
    remove: function(obj) {
        if(obj == undefined) return;
        var index = this.objects.indexOf(obj);

        if(index > -1) { var r = this.objects.splice(index,1); }
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
    removeShip: function(num) {
        this.remove(this.ships[num]);
        //this.ships[num] = undefined;
    },
    addTorp: function(num, torpObj) {
        this.torps[num] = torpObj;
        this.add(torpObj);
    },
    removeTorp: function(num) {
        this.remove(this.torps[num]);
        this.torps[num] = undefined;
    },
    addPhaser: function(num, phasObj) {
        this.phasers[num] = phasObj;
        this.add(phasObj);
    },
    removePhaser: function(num) {
        this.remove(this.phasers[num]);
        this.phasers[num] = undefined;
    },

    addTractor: function(num, tracObj) {
        this.tractors[num] = tracObj;
        this.add(tracObj);
    },
    removeTractor: function(num) {
        this.remove(this.tractors[num]);
        this.tractors[num] = undefined;
    },

    centerView: function(x,y) {
        this.viewX = x;
        this.viewY = y;
    },

    // the world is measured in pixels; netrek returns values in units
    // the subgalacticFactor sets units per pixel
    netrek2world: function(x,y) {
        return [((x - this.viewX) / this.subgalacticFactor) + this.wCanvas.canvas.width/2,
                ((y - this.viewY) / this.subgalacticFactor) + this.wCanvas.canvas.height/2];
    },

    // the tactical map is measured in pixels; netrek returns values in units
    // the galacticFactor sets units per pixel
    netrek2tac: function(x,y) {
        return [x / this.galacticFactor + this.galaticXOffset,
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
        var carteX = offsetX - this.wCanvas.canvas.width/2;
        var carteY = this.wCanvas.canvas.height/2 - offsetY;
        var angle = Math.atan(carteX/carteY);
        // if the click was in a lower quadrent, augment the atan value
        if(carteY<0) {
            angle *= -1;
            if(carteX>0) angle = Math.PI - angle;
            else         angle = -Math.PI - angle;
        }

        return angle;
    },

    getAngleFromJoystick: function(x,y) {
        return Math.atan2(x,-y);
    },

    shipsByProximityToWorldPoint: function(x,y) {
        return this.ships.slice().sort(function(a,b) {
            return Math.pow(a.gfx.x-x,2)+Math.pow(a.gfx.y-y,2) - Math.pow(b.gfx.x-x,2)+Math.pow(b.gfx.y-y,2);
        });
    },

    Planet: function(placeX, placeY, name, features, includingWorld) {
        var planet_self = this;
        var world_xy = world.netrek2world(placeX, placeY);
        var cir = new Circle(18,
        {
            y: world_xy[0],
            x: world_xy[1],
            fill: 'none',
            stroke: '#FF0',
            align: "center"
        });
        var text = new TextNode(name.replace(/\x00/g,""),
                                {y:cir.radius+15, textAlign:"center",
                                 fill:'yellow', scale:1.2,
                                 font:"bold 9px courier"});
        cir.append(text);
        
        this.x = placeX;
        this.y = placeY;
        this.gfx = cir;
        this.name = name;
        this.fuel = false;
        this.repair = false;
        this.agri = false;

        this.armyGfx = new Polygon([0,0, 0,6, 6,6, 6,0],{stroke:"none", fill:"#00F", x:-14, y:2, opacity:0.4});
        this.armyGfx.append(new Circle(3,{stroke:"none", fill:"#00F", x:3, y:0, startAngle: Math.PI}));
        this.armyGfx.append(new Circle(3,{stroke:"none", fill:"#00F", x:3, y:-6}));
        this.gfx.append(this.armyGfx);

        this.armyCountGfx = new TextNode("0", {fill:"white", font:"bold 8px courier", y:2});
        this.armyGfx.append(this.armyCountGfx);

        var tac_xy = world.netrek2tac(placeX, placeY);
        this.galGfx = new Circle(this.radius,
        {
            y: tac_xy[0],
            x: tac_xy[1],
            stroke: "#FF0",
            radius: 7,
            zIndex:1,
            align: "center"
        });
        this.galGfx.x -= this.galGfx.radius;
        this.galGfx.y += this.galGfx.radius;

        var text = new TextNode(name.replace(/\x00/g,"").substring(0,3),
                                {y:this.galGfx.radius+7, textAlign:"center",
                                 fill:'yellow', scale:1.2,
                                 font:"bold 9px courier"});
        this.galGfx.append(text);

        this.includingWorld = includingWorld;
        this.gfxRoot = world.wGroup;
        this.isOnCanvas = true;
    }
}
world.Planet.prototype = {
    applyFlags: function(flags) {
        this.showRepair(!!(flags & PLREPAIR));
        this.showFuel(!!(flags & PLFUEL));
        this.showAgri(!!(flags & PLAGRI));
    },

    showRepair: function(doShow) {
        if(!this.repair && doShow) {
            this.gfx.append(new Polygon([0,0, -3,3, -3,8, 0,11, 0,19, -3,22, -3,26, 0,29, 0,23, 4,23, 4,29, 7,26, 7,22, 4,19, 4,11, 7,8, 7,3, 4,0, 4,6, 0,6],{stroke:"#4F0", fill:"#0F0", x:0, y:-this.gfx.radius+3, x:-3}));
            this.galGfx.append(new Circle(2, {x:-3, fill:"#0F0", stroke:"none"}));
        }
        this.repair = doShow;
    },

    showFuel: function(doShow) {
        if(!this.fuel && doShow) {
            var tank = new Polygon([0,0,5,0,8,2,8,13,0,13], {x:this.gfx.radius-12,y:-7, stroke:"#FF0", fill:"#F70"});
            tank.append(new Polygon([2,3,5,6], {stroke:"#FF0"}));
            tank.append(new Polygon([2,6,5,3], {stroke:"#FF0"}));
            this.gfx.append(tank);
            this.galGfx.append(new Circle(2, {x:3, fill:"#F70", stroke:"none"}));
        }
        this.fuel = doShow;
    },

    showAgri: function(doShow) {
        if(!this.agri && doShow) {
            this.galGfx.stroke = "#0FF";
            this.gfx.stroke = "#0FF";
            this.gfx.strokeWidth = 2;
        }
        this.agri = doShow;
    },

    showArmies: function(num) {
        this.armyCountGfx.text = num;
        if(num == 0) {
            this.armyGfx.opacity = 0;
            this.galGfx.fill = "none";
        }
        else if(num >= 5) {
            this.armyGfx.opacity = 1;
            this.galGfx.fill = "#44F";
        }
        else if(num < 5 && num > 0) {
            this.armyGfx.opacity = 0.4;
            this.galGfx.fill = "none";
        }
        this.armyGfx.changed = true;
    },

    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.append(this.gfx);
            this.isOnCanvas = true;
        } else if(!setOn && this.isOnCanvas) {
            this.gfx.removeSelf();
            this.isOnCanvas = false;
        }
    },

    setXY: function(x,y) {
        this.x = x;
        this.y = y;
    }
}
