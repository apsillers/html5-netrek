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
    wGroup: new PIXI.Container(),        // world group
    gGroup: new PIXI.Container(),        // galactic group
    planetGroup: new PIXI.Container(),
	gPlanetGroup: new PIXI.Container(),
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
    galacticXOffset: 0,
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
        this.wCanvas.style.cursor = cursor?"crosshair":"default";
    },

    showDirecting: function(directing) {
        this.directing = directing;
        hud.showDirectionWheel(directing);
    },

    init: function(lApp, rApp) {
        this.wCanvas = lApp.view;
        this.gCanvas = rApp.view;
		this.lGroup = lApp.stage;
		this.rGroup = rApp.stage;
        this.galacticFactor = 100000 / this.gCanvas.height;
        this.galacticXOffset = this.gCanvas.width - this.gCanvas.height - 0;

        new Border({x:0, y:0, width: 100000, height: 0})
        new Border({x:0, y:0, width: 0, height: 100000})
        new Border({x:100000, y:0, width: 0, height: 100000})
        new Border({x:0, y:100000, width: 100000, height: 0})

        var dims = this.netrek2tac(100000, 100000);
        var rect = new PIXI.Graphics().lineStyle(2,0xFFFFFF,0.7).beginFill(0x444444).drawRect(0,0,dims[0] - this.galacticXOffset, dims[1]);
        rect.position.x = this.galacticXOffset;
        this.gGroup.addChild(rect);
		this.gGroup.addChild(this.gPlanetGroup);
		this.wGroup.addChild(this.planetGroup);
    },

    draw: function() {
        
		this.lGroup.addChild(this.wGroup);

        if(smallMode) {
            this.wCanvas.addChild(this.gGroup);
        } else {
            this.rGroup.addChild(this.gGroup);
        }

        var _self = this;
        _self.redrawInterval = setInterval(function recenter(){

            var debugStr = _self.objects.length+"<br/>";

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

                //if(obj instanceof Phaser) { debugStr+="Phaser</br>"; console.log(obj.gfx); }

                // update display of object in tactical
                if(obj.galGfx) { 
                    var tac_coords = _self.netrek2tac(obj.x, obj.y);
                    obj.galGfx.x = tac_coords[0];
                    obj.galGfx.y = tac_coords[1];
                    obj.galGfx.changed = true;
                }

                // objects not on canvas shouldn't get drawn
                //obj.setOnCanvas(Math.abs(centerX - obj.x) < cnvHalfWid && Math.abs(centerY - obj.y) < cnvHalfHgt);
            }

            //$("#debug").html(debugStr);
        }, REDRAW_RATE);

        hud.draw();

        // UI: set dest heading via right-click
        $(this.wCanvas).bind("contextmenu", _self.setCourseWithRightClick = function (e) {
            var offset = $(this).offset();
            var offsetX = e.pageX - offset.left;
            var offsetY = e.pageY - offset.top;
            // get the angle
            net.sendArray(CP_DIRECTION.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
            e.preventDefault();
        });
        
        // UI: fire torps via left-click
        $(this.wCanvas).click(function fireTorpWithLeftClick(e) {
            if(!_self.tractorCursor) {
                var offset = $(this).offset();
                var offsetX = e.pageX - offset.left;
                var offsetY = e.pageY - offset.top;

                    if(!e.shiftKey) {
						console.log(this.uiElementWasJustClicked);
						if(hud.uiElementWasJustClicked!= null) { return; }
                        clearTimeout(_self.torpFireTimeout);
                        // maybe this click was intended for a UI element, which may cancel the torp fire
                        _self.torpFireTimeout = setTimeout(function() {
							net.sendArray(CP_TORP.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
						}, 10);
                    } else {
                        net.sendArray(CP_PHASER.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
                    }
            } else {
                setTimeout(function(){ _self.setTractorCursor(false) }, 100);
            }
            e.preventDefault();
        });

        // UI: fire phasers via middle-click
        $(this.wCanvas).mousedown(function firePhasersWithMiddleClick(e) {
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

        $(this.wCanvas).bind("touchstart", function(e) {
            if(!_self.tractorCursor && !_self.directing) {
                var offset = $(this).offset();
                var offsetX = e.targetTouches[0].pageX - offset.left;
                var offsetY = e.targetTouches[0].pageY - offset.top;
                if(Math.abs(offsetX - parseInt(this.width) / 2) < 20 &&
                   Math.abs(offsetY - parseInt(this.height) / 2) < 20) {
                    _self.showDirecting(true);
                }
            } else if(_self.directing) {
                var offset = $(this).offset();
                var offsetX = e.changedTouches[0].pageX - offset.left;
                var offsetY = e.changedTouches[0].pageY - offset.top;
                net.sendArray(CP_PHASER.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY))));
            }
        });

        $(this.wCanvas).bind("touchmove", function(e) {
            if(_self.directing) {
                var offset = $(this).offset();
                var offsetX = e.targetTouches[0].pageX - offset.left;
                var offsetY = e.targetTouches[0].pageY - offset.top;
                _self.directingAngle = _self.getAngleFromCenter(offsetX, offsetY);
                hud.showDirectionAngle(_self.directingAngle);
                e.preventDefault();
            }
        });

        $(this.wCanvas).bind("touchend", function(e) {
            if(_self.directing) {
                net.sendArray(CP_DIRECTION.data(_self.rad2byte(_self.directingAngle)));
                _self.showDirecting(false);
            } else {
                clearTimeout(_self.torpFireTimeout);
                var offset = $(this).offset();
                var offsetX = e.changedTouches[0].pageX - offset.left;
                var offsetY = e.changedTouches[0].pageY - offset.top;
                _self.torpFireTimeout = setTimeout(function() { net.sendArray(CP_TORP.data(_self.rad2byte(_self.getAngleFromCenter(offsetX, offsetY)))); }, 10);
            }
        });

        gamepad.startReading();
    },

    undraw: function() {
        this.lGroup.removeChild(this.wGroup);
        if(smallMode) {
            this.lGroup.removeChild(this.gGroup);
        } else {
            this.rGroup.removeChild(this.gGroup);
        }
        hud.undraw();
        clearInterval(this.redrawInterval);
        $(this.wCanvas).unbind("click", this.fireTorpWithLeftClick);
        $(this.wCanvas).unbind("contextmenu", this.setCourseWithRightClick);
        $(this.wCanvas).unbind("mousedown", this.firePhasersWithMIddleClick);
        $(this.wCanvas).unbind("keyup", this.handleKeys);

        $(this.wCanvas).unbind("touchstart", this.startDirectingOnTouch);
        $(this.wCanvas).unbind("touchmove", this.changeDirectingOnMove);
        $(this.wCanvas).unbind("touchend", this.sendDirectionOnEnd);

        gamepad.stopReading();

        this.drawn = false;
    },

    add: function(obj) {
        this.wGroup.addChild(obj.gfx);

        if(obj.galGfx) this.gGroup.addChild(obj.galGfx);
        this.objects.push(obj);
    },
    remove: function(obj) {
        if(obj == undefined) return;
        var index = this.objects.indexOf(obj);

        if(index > -1) { var r = this.objects.splice(index,1); }
        obj.gfx.parent.removeChild(obj.gfx);
        if(obj.galGfx) { obj.galGfx.parent.removeChild(obj.galGfx); }
    },
    addPlanet: function(num, planetObj) {
        this.planets[num] = planetObj;
        this.planetGroup.addChild(planetObj.gfx);

        if(planetObj.galGfx) this.gPlanetGroup.addChild(planetObj.galGfx);
        this.objects.push(planetObj);
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
        return [((x - this.viewX) / this.subgalacticFactor) + this.wCanvas.width/2,
                ((y - this.viewY) / this.subgalacticFactor) + this.wCanvas.height/2];
    },

    // the tactical map is measured in pixels; netrek returns values in units
    // the galacticFactor sets units per pixel
    netrek2tac: function(x,y) {
        return [x / this.galacticFactor + this.galacticXOffset,
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
        var angle = Math.atan2(carteX, carteY);
        // if the click was in a lower quadrent, augment the atan value
        //if(carteY<0) {
        //    angle *= -1;
        //    if(carteX>0) angle = Math.PI - angle;
        //    else         angle = -Math.PI - angle;
        //}

        return angle;
    },

    getAngleFromJoystick: function(x,y) {
        return Math.atan2(x,-y);
    },

    Planet: function(placeX, placeY, name, features, includingWorld) {
        var planet_self = this;
        var world_xy = world.netrek2world(placeX, placeY);
        var cir = new PIXI.Graphics().lineStyle(2,0x999900,1).drawCircle(0,0,19);
        cir.position.set(world_xy[0], world_xy[1]);

        var text = new PIXI.Text(name.replace(/\x00/g,""), { fill:0xFFFF00, fontWeight:"bold", fontSize:"11px", fontFamily:"arial" });
        text.position.y = cir.height/2;
		text.position.x = -text.width/2;
        cir.addChild(text);
        
        this.x = placeX;
        this.y = placeY;
        this.gfx = cir;
        this.name = name;
        this.fuel = false;
        this.repair = false;
        this.agri = false;

        this.armyGfx = new PIXI.Container();
		this.armyGfx.addChild(new PIXI.Graphics().beginFill(0x0000FF).drawPolygon([0,0, 0,6, 6,6, 6,0]));
        this.armyGfx.position.set(-14, -2);
        var part1 = new PIXI.Graphics().beginFill(0x0000FF).arc(0, 0, 3, Math.PI, Math.PI * 2);
        part1.position.set(3,0);
        this.armyGfx.addChild(part1);
        var part2 = new PIXI.Graphics().beginFill(0x0000FF).drawCircle(0, 0, 3);
        part2.position.set(3,-6);
        this.armyGfx.addChild(part2);
        this.gfx.addChild(this.armyGfx);

        this.armyCountGfx = new PIXI.Text("0", {fill:0xFFFFFF, fontWeight:"bold", fontSize:"8px", fontFamily:"courier"});
		this.armyCountGfx.position.y = 2;
        this.armyGfx.addChild(this.armyCountGfx);

        var tac_xy = world.netrek2tac(placeX, placeY);
		this.galGfx = new PIXI.Graphics().lineStyle(1,0xFFFF00,1).drawCircle(-3.5,-3.5,7);
		this.galGfx.position.set(tac_xy[0], tac_xy[1]);
        this.galGfx.x -= this.galGfx.width/2;
        this.galGfx.y += this.galGfx.width/2;

        text = new PIXI.Text(name.replace(/\x00/g,"").substring(0,3), { fill:0xFFFF00, fontWeight:"bold", fontSize:"9px", fontFamily:"arial"});
        text.position.y = this.galGfx.width/2;
		text.position.x = -3*text.width/4;
        this.galGfx.addChild(text);

        this.includingWorld = includingWorld;
        this.gfxRoot = world.wGroup;
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
            var wrench = new PIXI.Graphics().lineStyle(1,0x44FF00,1).beginFill(0x00FF00).drawPolygon([0,0, -3,3, -3,8, 0,11, 0,19, -3,22, -3,26, 0,29, 0,23, 4,23, 4,29, 7,26, 7,22, 4,19, 4,11, 7,8, 7,3, 4,0, 4,6, 0,6]);
			wrench.position.set(-3, -this.gfx.height/4+2);
            this.gfx.addChild(wrench);
			var dot = new PIXI.Graphics().beginFill(0x00FF00).drawCircle(-7,-3,2);
			this.galGfx.addChild(dot);
        }
        this.repair = doShow;
    },

    showFuel: function(doShow) {
        if(!this.fuel && doShow) {
            var tank = new PIXI.Graphics().lineStyle(1,0xFFFF00,1).beginFill(0xFF7700).drawPolygon([0,0,5,0,8,2,8,13,0,13]);
			tank.position.set(this.gfx.width/2-13,-7);
            tank.addChild(new PIXI.Graphics().lineStyle(1,0xFFFF00,1).drawPolygon([2,3,5,6]));
            tank.addChild(new PIXI.Graphics().lineStyle(1,0xFFFF00,1).drawPolygon([2,6,5,3]));
            this.gfx.addChild(tank);
            this.galGfx.addChild(new PIXI.Graphics().beginFill(0xFF7700).drawCircle(0,-3,2));
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
            this.armyGfx.alpha = 0;
            this.galGfx.fill = "none";
        }
        else if(num >= 5) {
            this.armyGfx.alpha = 1;
            this.galGfx.fill = "#44F";
        }
        else if(num < 5 && num > 0) {
            this.armyGfx.alpha = 0.4;
            this.galGfx.fill = "none";
        }
        this.armyGfx.changed = true;
    },

    setOnCanvas: function(setOn) {
        if(setOn && !this.isOnCanvas) {
            this.gfxRoot.addChild(this.gfx);
            this.isOnCanvas = true;
        } else if(!setOn && this.isOnCanvas) {
            obj.gfx.parent.removeChild(obj.gfx);
            this.isOnCanvas = false;
        }
    },

    setXY: function(x,y) {
        this.x = x;
        this.y = y;
    }
}
