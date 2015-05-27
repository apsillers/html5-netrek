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



    Singleton for controlling the various UI meters
    (health, shields, fuel, speed, temp, armies...)
*/
hud = {
    inited: false,
    hCanvas: null,
    rCanvas: null,
    shieldMeter: null,
    shieldText: null,
    damageMeter: null,
    damageText: null,
    fuelMeter: null,
    fuelText: null,
    uiGfx: null,
    targetSpeed: 0,
    drawn: false,

    init: function(canvas, rcanvas) {
        this.hCanvas = canvas;
        this.rCanvas = rcanvas;
        this.uiGfx = new CanvasNode();
        this.uiGfxRight = new CanvasNode({x:1, y:4});
 
        this.healthMeter = new CanvasNode();
        this.healthCircle = new Circle(29, {fill:"#0A0", stroke:"none", rotation:-3*Math.PI/4, startAngle:0, endAngle:Math.PI});
        this.damageMeter = new Circle(15, {stroke:"#A00", fill:"none", strokeWidth:30, startAngle:0, endAngle:Math.PI});
        this.damageText = new TextNode("100",{fill:"white", rotation:-this.healthCircle.rotation, textAlign:"center", font:"bold 9pt courier", x:0, y:12});
        this.shieldMeter =  new Circle(28, {strokeWidth:30, fill:"none", stroke:"#3AF", rotation:-3*Math.PI/4, startAngle:0, endAngle:Math.PI});
        this.shieldText = new TextNode("100",{fill:"white", rotation:-this.shieldMeter.rotation, textAlign:"center", font:"bold 9pt courier", x:20, y:20});
        this.healthMeter.append(this.shieldMeter);
        this.healthMeter.append(this.healthCircle);
        this.healthCircle.append(this.damageMeter);
        this.healthCircle.append(this.damageText);
        this.shieldMeter.append(this.shieldText);
        this.uiGfx.append(this.healthMeter);

        this.fuelBox = new Polygon([0,0,0,-60,60,0],{stroke:"#FFF",strokeWidth:0, fill:"none", borderRadius:5});
        this.fuelMeter = new Polygon([0,0,0,-60,60,0], {fill:"#F70", stroke:"none"});
        this.fuelText = new TextNode("100",{y:-10,x:15,textAlign:"center",fill:"white",font:"bold 9pt courier"});
        this.fuelBox.append(this.fuelMeter);
        this.fuelBox.append(this.fuelText);
        this.uiGfx.append(this.fuelBox);

        this.maxSpeed = 12;
        this.targetSpeed = 0;
        this.speedMeter = new Polygon([0,0, 0,-300, 50,-300, 20,0], {x:20, y:350, fill:"none", stroke: "white", strokeWidth:2});
        this.meter = new Rectangle(0,0);
        this.speedPointer = new Polygon([-2,0, -9,-3, -9,3], {fill:"none", stroke: "white", strokeWidth:1});
        this.speedNumber = new TextNode("0", { fill: "white", font:"bold 12pt courier", y:25 });
        this.speedMeter.append(this.meter);
        this.speedMeter.append(this.speedPointer);
        this.speedMeter.append(this.speedNumber);
        
        this.smallModeSpeedMeter = new CanvasNode({x:10, y:65});
        this.smallModeCurrentSpeed = new TextNode("0", { fill: "white", font:"bold 16pt courier", x:0, y:30 });
        this.smallModeTargetSpeed = new TextNode("0", { fill: "green", font:"bold 16pt courier", x:25, y:30 });
        this.smallModeSpeedPlus = new Circle(15, {fill:"#0A0", stroke:"#0F0", x:32, y:-3 });
        this.smallModeSpeedPlus.append(new TextNode("+", { fill: "#0F0", font:"bold 16pt courier", align:"center", y:5 }));
        this.smallModeSpeedMinus = new Circle(15, {fill:"#700", stroke:"#F00", x:32, y:50 });
        this.smallModeSpeedMinus.append(new TextNode("-", { fill: "#F00", font:"bold 16pt courier", align:"center", y:5 }));
        this.smallModeSpeedMeter.append(this.smallModeCurrentSpeed);
        this.smallModeSpeedMeter.append(this.smallModeTargetSpeed);
        this.smallModeSpeedMeter.append(this.smallModeSpeedPlus);
        this.smallModeSpeedMeter.append(this.smallModeSpeedMinus);

        this.speedNotches = [];
        for(var i=0; i<12; ++i) {
            var frac = Math.pow(i/12, 0.75);
            this.speedNotches[i] = new Line(0,-frac*300, 20 + frac*30,-frac*300, { opacity:0.4 });
            this.speedMeter.append(this.speedNotches[i]);
        }

        this.setSpeedOnClick = function(e) {
            var y = -e.pageY + $(e.target).offset().top + hud.speedMeter.y;
            var speed = Math.ceil(12 * Math.pow(y/300,1/0.75));
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
            e.stopPropagation();
            clearTimeout(world.torpFireTimeout);
        }
        this.speedMeter.addEventListener("click", this.setSpeedOnClick);

        function speedChanger(diff) {
            return function(e) {
                this.targetSpeed = Math.max(0, Math.min(this.targetSpeed+diff, this.maxSpeed));
                this.smallModeTargetSpeed.text = this.targetSpeed;
                net.sendArray(CP_SPEED.data(this.targetSpeed));
                e.stopPropagation();
                clearTimeout(world.torpFireTimeout);
            }.bind(hud);
        }
        this.smallModeSpeedPlus.addEventListener("click", speedChanger(1));  
        this.smallModeSpeedMinus.addEventListener("click", speedChanger(-1));        

        this.etempMeter = new Polygon([0,0, 20,0, 20,-100], {x:50, y:350, fill:"none", stroke: "#AAA", strokeWidth:2});
        this.etempBar = new Rectangle(0,0);
        this.etempMeter.append(this.etempBar);
        this.uiGfx.append(this.etempMeter);

        this.armyStatNode = new CanvasNode({x:100, y:480});
        this.uiGfx.append(this.armyStatNode);

        this.armyGfx = new Polygon([0,0, 0,10, 10,10, 10,0],{stroke:"none", fill:"#00F", opacity:1});
        this.armyGfx.append(new Circle(5,{stroke:"none", fill:"#00F", x:5, y:0}));
        this.armyGfx.append(new Circle(5,{stroke:"none", fill:"#00F", x:5, y:-10}));
        this.armyStatNode.append(this.armyGfx);

        this.armyText = new TextNode("", {fill:"white", x:16, font:"bold 12pt courier" });
        this.armyStatNode.append(this.armyText);

        this.warning = new Rectangle(this.hCanvas.width-30,25, {x: 15, y: 15, stroke:"#F00", fill: "#F44", opacity:0 });
        this.warningText = new TextNode("", {fill:"white", y:15, x:5, font:"bold 10pt courier"});
        this.warning.append(this.warningText);
        this.uiGfx.append(this.warning);
        this.warningTimeout = null;

        /* wheel for steering in touch interfaces */
        this.directionWheel = new Circle(40, { stroke: "#ccc", fill: "none",
                                               opacity: 0.7, strokeWidth:20 });
        this.directionNeedle = new Line(0, this.directionWheel.radius - this.directionWheel.strokeWidth / 2,
                                        0, this.directionWheel.radius + this.directionWheel.strokeWidth / 2,
                                        { x:0, y:0, stroke:"blue", strokeWidth:4 });
        this.directionWheel.append(this.directionNeedle);
        this.weaponNeedle = new Line(0, this.directionWheel.radius - this.directionWheel.strokeWidth / 2,
                                        0, this.directionWheel.radius + this.directionWheel.strokeWidth / 2,
                                        { x:0, y:0, stroke:"red", strokeWidth:4 });


        /* add right-panel buttons */
        this.shieldButton = this.createButton(0, 0, "blue", "s", "Shield", "bold 14pt courier",
                             function(){ net.sendArray(CP_SHIELD.data(world.player.shields?0:1)); });
        this.uiGfxRight.append(this.shieldButton);

        this.cloakButton = this.createButton(0, 50, "#797", "c", "Cloak", "bold 14pt courier",
                            function(){ net.sendArray(CP_CLOAK.data(world.player.cloaked?0:1)); });
        this.uiGfxRight.append(this.cloakButton);

        this.repairButton = this.createButton(0, 100, "orange", "Sft+R", "Repair", "bold 10pt courier",
                             function(){ net.sendArray(CP_REPAIR.data(world.player.repairing?0:1)); });
        this.uiGfxRight.append(this.repairButton);

        this.tractorButton = this.createButton(0, 150, "green", "Sft+R", "Tractor", "bold 10pt courier", function(){
            if(world.player.tractoring) { net.sendArray(CP_TRACTOR.data(0,0)); }
            else { world.setTractorCursor(true, false); }
        });
        this.uiGfxRight.append(this.tractorButton);

        this.pressorButton = this.createButton(0, 200, "purple", "y", "Pressor", "bold 14pt courier", function(){
            if(world.player.pressing) { net.sendArray(CP_REPRESS.data(0,0)); }
            else { world.setTractorCursor(true, true); }
        });
        this.uiGfxRight.append(this.pressorButton);

        this.orbitButton = this.createButton(50, 0, "yellow", "o", "Orbit", "bold 14pt courier",
                            function(){ net.sendArray(CP_ORBIT.data(world.player.orbitting?0:1)); });
        this.uiGfxRight.append(this.orbitButton);

        this.bombButton = this.createButton(50, 50, "red", "b", "Bomb", "bold 14pt courier", function(){
            net.sendArray(CP_BOMB.data(world.player.bombing?0:1));
        });
        this.pickupButton = this.createButton(50, 100, "#ffd700", "z", "Pickup", "bold 14pt courier", function(){
            net.sendArray(CP_BEAM.data(1));
        });
        this.dropButton = this.createButton(50, 150, "#ffd700", "x", "Drop", "bold 14pt courier", function(){
            net.sendArray(CP_BEAM.data(2));
        });

        this.dPadMap = new CanvasNode({});
        this.dPadMap.append(new Polygon([0,0, 20,0, 20,20, 40,20, 40,40, 20,40, 20,60, 0,60, 0,40, -20,40, -20,20, 0,20], {fill:"#444", stroke:"white", zIndex:-50}));
        this.dPadUp = new TextNode("", {fill:"white", font:"bold 8pt courier", y:-5, x:10, align:"center"});
        this.dPadMap.append(this.dPadUp);
        this.dPadDown = new TextNode("", {fill:"white", font:"bold 8pt courier", y:70, x:10, align:"center"});
        this.dPadMap.append(this.dPadDown);
        this.dPadLeft = new TextNode("", {fill:"white", font:"bold 8pt courier", y:32, x:-25, align:"right"});
        this.dPadMap.append(this.dPadLeft);
        this.dPadRight = new TextNode("", {fill:"white", font:"bold 8pt courier", y:32, x:45, align:"left"});
        this.dPadMap.append(this.dPadRight);

        this.showMapButton = new CanvasNode();
        this.showMapButton.append(new Circle(25, {fill:"#0AA", stroke:"#0FF", x:32, y:200 }));
        this.showMapButton.append(new TextNode("Map", {fill:"white", font:"12pt courier", x:32, y:200, align:"center"}))
        this.uiGfx.append(this.showMapButton);

        this.showMapButton.addEventListener("click", function() {
            world.gGroup.visible = !world.gGroup.visible;
            clearTimeout(world.torpFireTimeout);
        });

        this.dPadCommands = [
            ["Beam up", "Orbit", "Beam down", "Bomb"],
            ["Report", "Carry", "Chat", "Carry"],
            ["Repair", "Shields", "", "Cloak"],
            ["Tractor", "Det torps", "Pressor", "Det own"],
        ]
    },

    draw: function() {
        this.hCanvas.append(this.uiGfx);

        if(!smallMode) {
            this.uiGfxRight.x = 0;
            if(!outfitting.drawn) {
                this.rCanvas.append(this.uiGfxRight);
            }
        } else {
            this.uiGfxRight.x = leftCanvas.width - 120;
            this.uiGfx.append(this.uiGfxRight);
            world.gGroup.visible = false;
        }

        this.drawn = true;
        this.reposition();
    },

    // used to shift elements when the canvas is resized
    reposition: function() {
        var leftCanvas = this.hCanvas.canvas;
        this.setXY(this.healthCircle, 45, leftCanvas.height-30);
        this.setXY(this.shieldMeter, 38, leftCanvas.height-37);
        this.setXY(this.fuelBox, 4, leftCanvas.height-5);
        this.setXY(this.directionWheel, leftCanvas.width / 2, leftCanvas.height / 2);
        this.setXY(this.dPadMap, leftCanvas.width - 100, leftCanvas.height - 100);

        if(!smallMode) {
            this.uiGfx.append(this.speedMeter);
            this.uiGfx.removeChild(this.smallModeSpeedMeter);
            this.uiGfx.append(this.showMapButton);
            if(this.drawn) {
                this.uiGfxRight.x = 1;
                this.uiGfxRight.x = 4;
                this.uiGfx.removeChild(this.uiGfxRight);
                this.rCanvas.appendChild(this.uiGfxRight);
                this.rCanvas.appendChild(world.gGroup);
                world.gGroup.x = 0;
            }
            this.uiGfx.remove(this.showMapButton);
            world.gGroup.visible = true;
            this.etempMeter.x = 50;
            this.etempMeter.y = 350;
        } else {
            this.uiGfx.append(this.showMapButton);
            this.uiGfx.append(this.smallModeSpeedMeter);
            this.uiGfx.removeChild(this.speedMeter);
            this.uiGfxRight.x = leftCanvas.width - 120;
            this.uiGfxRight.y = 50;
            this.uiGfx.append(this.uiGfxRight);
            this.etempMeter.x = 70;
            this.etempMeter.y = 150;
            if(this.drawn) {
                hud.hCanvas.appendChild(world.gGroup);
                world.gGroup.x = -world.galacticXOffset - (world.netrek2tac(100000)[0] - world.galacticXOffset) / 2 + hud.hCanvas.width / 2;
            }
        }

	this.uiGfx.changed = true;

        this.warning.width = leftCanvas.width-30;
        this.warning.changed = true;
    },

    undraw: function() {
        this.hCanvas.removeChild(this.uiGfx);
        this.rCanvas.removeChild(this.uiGfxRight);
        this.uiGfx.removeChild(this.uiGfxRight);
        this.drawn = false;
    },

    setXY: function(gfx, x, y) {
        gfx.x = x;
        gfx.y = y;
        gfx.changed = true;
    },

    createButton: function(x, y, color, key, text, font, onClick) {
        var width = 45, height = 45;
        var button = new Rectangle(width,height, { stroke:color, cursor: "pointer", fill:"black", x:x, y:y });
        button.append(new TextNode(key, {fill:"white", font:font, y:17, x:22, align:"center"}));
        button.append(new TextNode(text, {fill:"white", font:"bold 8pt courier", y:31, x:22, align:"center"}));
        button.addEventListener("click",function() {
            onClick.call(this);
            clearTimeout(world.torpFireTimeout);
        });
        return button;
    },

    showDPadCommands: function(buttonNum) {
        var commands = this.dPadCommands[buttonNum];
        this.dPadUp.text = commands[0];
        this.dPadRight.text = commands[1];
        this.dPadDown.text = commands[2];
        this.dPadLeft.text = commands[3];
        this.uiGfx.append(this.dPadMap);
        this.dPadMap.changed = true;
    },
    hideDPadCommands: function() {
        this.uiGfx.remove(this.dPadMap);
    },

    showDirectionWheel: function(show) {
        if(show) { this.uiGfx.append(this.directionWheel); }
        else { this.uiGfx.remove(this.directionWheel); }
    },
    showWeaponNeedle: function(show) {
        if(show) { this.directionWheel.append(this.weaponNeedle); }
        else { this.directionWheel.remove(this.weaponNeedle); }
    },
    showDirectionNeedle: function(show) {
        if(show) { this.directionWheel.append(this.directionNeedle); }
        else { this.directionWheel.remove(this.directionNeedle); }
    },
    showDirectionAngle: function(rads) {
        this.directionNeedle.rotation = [rads+Math.PI,0,0];
        this.directionNeedle.changed = true;
    },
    showWeaponAngle: function(rads) {
        this.weaponNeedle.rotation = [rads+Math.PI,0,0];
        this.weaponNeedle.changed = true;
    },


    setShieldIndic: function(shieldsUp) {
        this.shieldButton.fill = shieldsUp?"blue":"black";
    },
    setCloakIndic: function(cloakUp) {
        this.cloakButton.fill = cloakUp?"#797":"black";
    },
    setRepairIndic: function(repairUp) {
        this.repairButton.fill = repairUp?"orange":"black";
    },
    setOrbitIndic: function(orbit) {
        this.orbitButton.fill = orbit?"#ffd700":"black";
        if(orbit) {
            this.uiGfxRight.append(this.dropButton);
            this.uiGfxRight.append(this.pickupButton);
            this.uiGfxRight.append(this.bombButton);
        } else {
            this.uiGfxRight.remove(this.dropButton);
            this.uiGfxRight.remove(this.pickupButton);
            this.uiGfxRight.remove(this.bombButton);
       }
    },
    setBombIndic: function(bomb) {
        this.bombButton.fill = bomb?"blue":"black";
    },
    setPressorIndic: function(pressor) {
        this.pressorButton.fill = pressor?"purple":"black";
    },
    setTractorIndic: function(tractor) {
        this.tractorButton.fill = tractor?"green":"black";
    },

    showMaxSpeed: function(maxSpeed) {
        this.maxSpeed = maxSpeed;
        
        for(var i=0; i<this.speedNotches.length; ++i) {
            this.speedNotches[i].stroke = "white";
            this.speedNotches[i].changed = true;
        }

        // if the max speed is less than the max possible, max the current max
        if(this.speedNotches.length > maxSpeed) {
            this.speedNotches[maxSpeed].stroke = "red";
            this.speedNotches[maxSpeed].changed = true;
        }
    },

    showWarning: function(msg) {
        if(msg == "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x13\x0FB") return;

        msg = msg.replace(/Helmsman:\s+/, "").replace(/,? captain!/, "!");

        var self = this;
        this.warning.opacity = 0.7;
        this.warningText.text = msg;
        this.warning.changed = true;
        if(this.warningTimeout) { clearTimeout(this.warningTimeout); }
        this.warningTimeout = setTimeout(function() { self.hideWarning(); }, 4000);
    },
    hideWarning: function(msg) {
        this.warning.opacity = 0;
        this.warning.changed = true;
        this.warningTimeout = null;
    },
    showShieldLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
        this.shieldMeter.startAngle = (100-percent)/100 * Math.PI;
        this.shieldText.text = Math.floor(percent).toString();
        this.shieldMeter.changed = true;
    },
    showHullLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent))
        this.damageMeter.endAngle = (100-percent)/100 * Math.PI;
        this.damageText.text = Math.floor(percent).toString();
        this.healthMeter.changed = true;
    },
    showFuelLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
        var level = 60 * Math.pow(percent/100, 0.9);
        this.fuelBox.removeChild(this.fuelMeter);
        this.fuelMeter = new Polygon([0,0,0,-level,60-level,-level,60,0], {fill:"#F70", stroke:"none", zIndex:-50});
        this.fuelBox.appendChild(this.fuelMeter);
        this.fuelText.text = Math.floor(percent).toString() + "%";
        this.fuelMeter.changed = true;
    },
    showSpeed: function(speed) {
        var frac = Math.pow(speed/12, 0.75);
        this.speedMeter.remove(this.meter);
        this.meter = new Polygon([0,0, 0,-frac*300,frac*50, -frac*300], {fill:"green", strokeWidth:0, zIndex:-5});
        this.speedMeter.appendChild(this.meter);
        this.speedMeter.changed = true;

        this.smallModeCurrentSpeed.text = speed;

        if(speed) this.speedNumber.text = "Warp " + speed;
        else this.speedNumber.text = "";
    },
    showSpeedPointer: function(speed) {
        if(speed > this.maxSpeed) { speed = this.maxSpeed; }
        this.targetSpeed = speed;
        this.speedPointer.y = -300 * Math.pow(speed/12, 0.75);
        this.speedPointer.changed = true;
        this.smallModeTargetSpeed.text = speed;
    },
    showEngineTemp: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
        var y = 100 * Math.pow(percent/100, 0.9);
        var x = 20 * Math.pow(percent/100, 0.9);
        this.etempMeter.remove(this.etempBar);
        this.etempBar = new Polygon([0,0, 20,0, 20,-y, x,-y], {fill:new Gradient({colorStops:[[0, "#FFFF00"], [1, "#FF0000"]], startX:0, startY:0, endX:0, endY:-100}), stroke:"none", zIndex:-50});
        this.etempMeter.appendChild(this.etempBar);
        this.etempMeter.changed = true;
    },
    showArmies: function(armies, kills) {
        var maxArmies = Math.min(Math.floor(kills * 2), shipStats[world.player.shipType].maxArmies);

        this.armyText.text = armies + " / " + maxArmies;

        if(maxArmies == 0) {
            this.armyText.opacity = 0;
            this.armyText.changed = true;
            this.armyGfx.opacity = 0;
            this.armyGfx.changed = true;
        }
    }
}
