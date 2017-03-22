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
	lApp: null,
	rApp: null,
	
    shieldMeter: null,
    shieldText: null,
    damageMeter: null,
    damageText: null,
    fuelMeter: null,
    fuelText: null,
    uiGfx: null,
    targetSpeed: 0,
    drawn: false,

    init: function(lApp, rApp) {
        this.hCanvas = lApp.view;
        this.rCanvas = rApp.view;
		this.hGroup = lApp.stage;
		this.rGroup = rApp.stage;
		this.lApp = lApp;
		this.rApp = rApp;
        this.uiGfx = new PIXI.Container();
        this.uiGfxRight = new PIXI.Container({x:2, y:4});
 
        this.healthMeter = new PIXI.Container();
        this.healthCircle = new PIXI.Graphics().beginFill(0x00AA00).arc(0, 0, 29, 0, Math.PI, true);new PIXI.Graphics().beginFill(0x00AA00).arc(0, 0, 29, 0, Math.PI, true);
		this.healthCircle.rotation = Math.PI/4;
		this.damageMeter = new PIXI.Graphics().lineStyle(30,0xAA0000,1).arc(0, 0, 29, 0, 0, true);
		this.healthCircle.rotation = Math.PI/4;
        this.damageText = new PIXI.Text("100", {fill:0xFFFFFF,  fontWeight:"bold", fontSize:"9pt", fontFamily:"arial" });
		this.damageText.rotation = -this.healthCircle.rotation;
		this.damageText.position.set(-13,-10);
		this.shieldMeter = new PIXI.Graphics().lineStyle(30,0x33AAFF,1).arc(0, 0, 28, 0, Math.PI);
		this.shieldMeter.rotation = -3*Math.PI/4;
        this.shieldText = new PIXI.Text("100",{fill:0xFFFFFF, fontWeight:"bold", fontSize:"9pt", fontFamily:"arial" });
		this.shieldText.rotation = -this.shieldMeter.rotation;
		this.shieldText.position.set(35, 20);
		
		this.healthMeter.addChild(this.shieldMeter);
        this.healthMeter.addChild(this.healthCircle);
		this.healthCircle.addChild(this.damageMeter);
        this.healthCircle.addChild(this.damageText);
		this.shieldMeter.addChild(this.shieldText);
        this.uiGfx.addChild(this.healthMeter);

        this.fuelBox = new PIXI.Graphics().lineStyle(1,0xFFFFFF,1).drawPolygon([0,0,0,-60,60,0]);
        this.fuelMeter = new PIXI.Graphics().beginFill(0xFF7700).drawPolygon([0,0,0,-60,60,0]);
        this.fuelText = new PIXI.Text("100",{fill:0xFFFFFF, fontWeight:"bold", fontSize:"9pt", fontFamily:"arial"});
		this.fuelText.position.set(15-this.fuelText.width/2,-20);
        this.fuelBox.addChild(this.fuelMeter);
        this.fuelBox.addChild(this.fuelText);
        this.uiGfx.addChild(this.fuelBox);
		
        this.maxSpeed = 12;
        this.targetSpeed = 0;
        this.speedMeter = new PIXI.Container()
		this.speedMeterSprite = new PIXI.Sprite(lApp.renderer.generateTexture(new PIXI.Graphics().lineStyle(2,0xFFFFFF,1).beginFill(0xFFFFFF,0.1).drawPolygon([0,0, 0,-300, 50,-300, 20,0, 0,0])));
		this.speedMeterSprite.position.y = -300;
		this.speedMeterSprite.interactive = true;
		this.speedMeter.addChild(this.speedMeterSprite);
        this.speedMeter.position.set(20,350);
		this.meter = new PIXI.Graphics();
        this.speedPointer = new PIXI.Graphics().lineStyle(2,0xFFFFFF,1).drawPolygon([-2,0, -9,-3, -9,3, -2,0]);
        this.speedNumber = new PIXI.Text("0", { fill: 0xFFFFFF, fontWeight:"bold", fontSize:"12pt", fontFamily:"arial" });
		this.speedNumber.y = 35;
        this.speedMeter.addChild(this.meter);
        this.speedMeter.addChild(this.speedPointer);
        this.speedMeter.addChild(this.speedNumber);
        
        this.smallModeSpeedMeter = new PIXI.Container();
		this.smallModeSpeedMeter.position.set(10, 65);
        this.smallModeCurrentSpeed = new PIXI.Text("0", { fill: 0xFFFFFF, fontWeight:"bold", fontSize:"16pt", fontFamily:"arial" });
		this.smallModeCurrentSpeed.position.set(0, 30);
        this.smallModeTargetSpeed = new PIXI.Text("0", { fill: 0x00FF00, fontWeight:"bold", fontSize:"16pt", fontFamily:"arial" });
		this.smallModeTargetSpeed.position.set(25, 30);
        this.smallModeSpeedPlus = new PIXI.Graphics().beginFill(0x00AA00).lineStyle(1,0x00FF00,1).drawCircle(0,0,15)
		this.smallModeSpeedPlus.position.set(32, -3);
		var plusText = new PIXI.Text("+", { fill: "#0F0", fontWeight:"bold", fontSize:"16pt", fontFamily:"arial", align:"center" });
        this.smallModeSpeedPlus.addChild(plusText);
		plusText.position.set((this.smallModeSpeedPlus.width-plusText.width)/2, 7);
        this.smallModeSpeedMinus = new PIXI.Graphics().beginFill(0x770000).lineStyle(1,0xFF0000,1).drawCircle(0,0,15)
		this.smallModeSpeedMinus.position.set(32, 50);
		var minusText = new PIXI.Text("+", { fill: "#0F0", fontWeight:"bold", fontSize:"16pt", fontFamily:"arial", align:"center" });
        this.smallModeSpeedMinus.addChild(minusText);
		minusText.position.set((this.smallModeSpeedMinus.width-minusText.width)/2, 5);
        this.smallModeSpeedMeter.addChild(this.smallModeCurrentSpeed);
        this.smallModeSpeedMeter.addChild(this.smallModeTargetSpeed);
        this.smallModeSpeedMeter.addChild(this.smallModeSpeedPlus);
        this.smallModeSpeedMeter.addChild(this.smallModeSpeedMinus);

        this.speedNotches = [];
        for(var i=0; i<12; ++i) {
            var frac = Math.pow(i/12, 0.75);
            this.speedNotches[i] = new PIXI.Graphics().lineStyle(1,0xFFFFFF,0.4).moveTo(0,-frac*300).lineTo(20 + frac*30, -frac*300);
            this.speedMeter.addChild(this.speedNotches[i]);
        }

        this.setSpeedOnClick = function(e) {
            var y = hud.speedMeterSprite.height - e.data.global.y + hud.speedMeterSprite.worldTransform.ty;
            var speed = Math.ceil(12 * Math.pow(y/300,1/0.75));
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
            e.stopPropagation();
            clearTimeout(world.torpFireTimeout);
			hud.uiElementWasJustClicked = setTimeout(function() { hud.uiElementWasJustClicked = null; }, 10);
		}
        this.speedMeterSprite.on("click", this.setSpeedOnClick);

        function speedChanger(diff) {
            return function(e) {
                this.targetSpeed = Math.max(0, Math.min(this.targetSpeed+diff, this.maxSpeed));
                this.smallModeTargetSpeed.text = this.targetSpeed;
                net.sendArray(CP_SPEED.data(this.targetSpeed));
                e.stopPropagation();
                clearTimeout(world.torpFireTimeout);
            }.bind(hud);
        }
        //this.smallModeSpeedPlus.addEventListener("click", speedChanger(1));
        //this.smallModeSpeedMinus.addEventListener("click", speedChanger(-1));

        this.etempMeter = new PIXI.Graphics().lineStyle(2,0xAAAAAA,1).drawPolygon([0,0, 20,0, 20,-100,0,0]);
		this.etempMeter.position.set(50, 350);
        this.etempBar = new PIXI.Graphics();
        this.etempMeter.addChild(this.etempBar);
        this.uiGfx.addChild(this.etempMeter);

        this.armyStatNode = new PIXI.Container();
        this.uiGfx.addChild(this.armyStatNode);

        this.armyGfx = new PIXI.Graphics().beginFill(0x0000FF).drawPolygon([0,0, 0,10, 10,10, 10,0]);
		var circle1 = new PIXI.Graphics().beginFill(0x0000FF).drawCircle(0,0,5);
		circle1.position.set(5,-10);
        this.armyGfx.addChild(circle1)
		var circle2 = new PIXI.Graphics().beginFill(0x0000FF).drawCircle(0,0,5);
		circle2.position.set(5,1);
        this.armyGfx.addChild(circle2);
        this.armyStatNode.addChild(this.armyGfx);

        this.armyText = new PIXI.Text("", {fill:"white", fontWeight:"bold", fontSize:"12pt", fontFamily:"arial" });
		this.armyText.x = 16;
        this.armyStatNode.addChild(this.armyText);

        this.warning = new PIXI.Graphics().lineStyle(1,0xFF0000,1).beginFill(0xFF4444).drawRect(0,0,this.hCanvas.width-30,25);
		this.warning.position.set(15,15);
		this.warning.visible = false;
        this.warningText = new PIXI.Text("", {fill:"white", fontSize:"10pt", fontFamily:"arial"});
		this.warningText.position.set(2,5);
        this.warning.addChild(this.warningText);
        this.uiGfx.addChild(this.warning);
        this.warningTimeout = null;

        /* wheel for steering in touch interfaces */
        this.directionWheel = new PIXI.Graphics().lineStyle(20, 0xCCCCCC, 0.7).drawCircle(0,0,40);
        this.directionNeedle = new PIXI.Graphics().lineStyle(4, 0x0000FF, 1)
		                        .moveTo(0, this.directionWheel.radius - 10)
								.lineTo(0, this.directionWheel.radius + 10);
        this.directionWheel.addChild(this.directionNeedle);
        this.weaponNeedle = new PIXI.Graphics().lineStyle(4, 0xFF0000, 1)
		                        .moveTo(0, this.directionWheel.radius - 10)
								.lineTo(0, this.directionWheel.radius + 10);
		

        /* add right-panel buttons */
        this.shieldButton = this.createButton(0, 0, 0x0000FF, "s", "Shield", "bold 14pt arial",
                             function(){ net.sendArray(CP_SHIELD.data(world.player.shields?0:1)); });
        this.uiGfxRight.addChild(this.shieldButton);

        this.cloakButton = this.createButton(0, 45, 0x779977, "c", "Cloak", "bold 14pt arial",
                            function(){ net.sendArray(CP_CLOAK.data(world.player.cloaked?0:1)); });
        this.uiGfxRight.addChild(this.cloakButton);

        this.repairButton = this.createButton(0, 90,  0xFFA500, "Sft+R", "Repair", "bold 10pt arial",
                             function(){ net.sendArray(CP_REPAIR.data(world.player.repairing?0:1)); });
        this.uiGfxRight.addChild(this.repairButton);

        this.tractorButton = this.createButton(0, 135, 0x00FF00, "Sft+R", "Tractor", "bold 10pt arial", function(){
            if(world.player.tractoring) { net.sendArray(CP_TRACTOR.data(0,0)); }
            else { world.setTractorCursor(true, false); }
        });
        this.uiGfxRight.addChild(this.tractorButton);

        this.pressorButton = this.createButton(0, 180, 0xFF00FF, "y", "Pressor", "bold 14pt arial", function(){
            if(world.player.pressing) { net.sendArray(CP_REPRESS.data(0,0)); }
            else { world.setTractorCursor(true, true); }
        });
        this.uiGfxRight.addChild(this.pressorButton);

        this.orbitButton = this.createButton(50, 0, 0xFFFF00, "o", "Orbit", "bold 14pt arial",
                            function(){ net.sendArray(CP_ORBIT.data(world.player.orbitting?0:1)); });
        this.uiGfxRight.addChild(this.orbitButton);

        this.bombButton = this.createButton(50, 45, 0xFF0000, "b", "Bomb", "bold 14pt arial", function(){
            net.sendArray(CP_BOMB.data(world.player.bombing?0:1));
        });
        this.pickupButton = this.createButton(50, 90, 0xFFD700, "z", "Pickup", "bold 14pt arial", function(){
            net.sendArray(CP_BEAM.data(1));
        });
        this.dropButton = this.createButton(50, 135, 0xffd700, "x", "Drop", "bold 14pt arial", function(){
            net.sendArray(CP_BEAM.data(2));
        });
/*
        this.dPadMap = new CanvasNode({});
        this.dPadMap.addChild(new Polygon([0,0, 20,0, 20,20, 40,20, 40,40, 20,40, 20,60, 0,60, 0,40, -20,40, -20,20, 0,20], {fill:"#444", stroke:"white", zIndex:-50}));
        this.dPadUp = new TextNode("", {fill:"white", fontWeight:"bold", fontSize:"8pt", fontFamily:"arial", y:-5, x:10, align:"center"});
        this.dPadMap.addChild(this.dPadUp);
        this.dPadDown = new TextNode("", {fill:"white", fontWeight:"bold", fontSize:"8pt", fontFamily:"arial", y:70, x:10, align:"center"});
        this.dPadMap.addChild(this.dPadDown);
        this.dPadLeft = new TextNode("", {fill:"white", fontWeight:"bold", fontSize:"8pt", fontFamily:"arial", y:32, x:-25, align:"right"});
        this.dPadMap.addChild(this.dPadLeft);
        this.dPadRight = new TextNode("", {fill:"white", fontWeight:"bold", fontSize:"8pt", fontFamily:"arial", y:32, x:45, align:"left"});
        this.dPadMap.addChild(this.dPadRight);
*/
        this.showMapButton = new PIXI.Container();
		var mapButton = new PIXI.Graphics().lineStyle(1,0x00ffff,1).beginFill(0x00aaaa).drawCircle(0,0,25);
		mapButton.position.set(32,200);
        this.showMapButton.addChild(mapButton);
		var mapButtonText = new PIXI.Text("Map", {fill:"white", fontSize:"12pt", fontFamily:"arial", x:32, y:200, align:"center"});
		mapButtonText.position.set((this.showMapButton.width-mapButtonText.width)/2+32,200);
        this.showMapButton.addChild(mapButtonText);
		this.showMapButton = new PIXI.Sprite(lApp.renderer.generateTexture(this.showMapButton));
        this.uiGfx.addChild(this.showMapButton);

        this.showMapButton.on("click", function() {
            world.gGroup.visible = !world.gGroup.visible;
            clearTimeout(world.torpFireTimeout);
			hud.uiElementWasJustClicked = setTimeout(function() { hud.uiElementWasJustClicked = null; }, 10);
        });

        this.dPadCommands = [
            ["Beam up", "Orbit", "Beam down", "Bomb"],
            ["Report", "Carry", "Chat", "Carry"],
            ["Repair", "Shields", "", "Cloak"],
            ["Tractor", "Det torps", "Pressor", "Det own"],
        ]
		
    },

    draw: function() {
        this.hGroup.addChild(this.uiGfx);

        if(!smallMode) {
            this.uiGfxRight.x = 0;
            if(!outfitting.drawn) {
                this.rGroup.addChild(this.uiGfxRight);
            }
        } else {
            this.uiGfxRight.x = leftCanvas.width - 120;
            this.uiGfx.addChild(this.uiGfxRight);
            world.gGroup.visible = false;
        }

        this.drawn = true;
        this.reposition();
    },

    // used to shift elements when the canvas is resized
    reposition: function() {
        var leftCanvas = this.hCanvas;
        this.setXY(this.healthCircle, 45, leftCanvas.height-30);
        this.setXY(this.shieldMeter, 38, leftCanvas.height-37);
        this.setXY(this.fuelBox, 4, leftCanvas.height-5);
        this.setXY(this.directionWheel, leftCanvas.width / 2, leftCanvas.height / 2);
		this.armyStatNode.position.set(100, leftCanvas.height-30);
        //this.setXY(this.dPadMap, leftCanvas.width - 100, leftCanvas.height - 100);
		

        if(!smallMode) {
            this.uiGfx.addChild(this.speedMeter);
            this.uiGfx.removeChild(this.smallModeSpeedMeter);
            this.uiGfx.addChild(this.showMapButton);
            if(this.drawn) {
                this.uiGfxRight.x = 1;
                this.uiGfxRight.x = 4;
                this.uiGfx.removeChild(this.uiGfxRight);
                this.rGroup.addChild(this.uiGfxRight);
                world.gGroup.x = 0;
            }
            this.uiGfx.removeChild(this.showMapButton);
            world.gGroup.visible = true;
            this.etempMeter.x = 50;
            this.etempMeter.y = 350;
        } else {
            this.uiGfx.addChild(this.showMapButton);
            this.uiGfx.addChild(this.smallModeSpeedMeter);
            this.uiGfx.removeChild(this.speedMeter);
            this.uiGfxRight.x = leftCanvas.width - 120;
            this.uiGfxRight.y = 50;
            this.uiGfx.addChild(this.uiGfxRight);
            this.etempMeter.x = 70;
            this.etempMeter.y = 150;
            if(this.drawn) {
                hud.hCanvas.addChild(world.gGroup);
                world.gGroup.x = -world.galacticXOffset - (world.netrek2tac(100000)[0] - world.galacticXOffset) / 2 + hud.hCanvas.width / 2;
            }
        }
		
        this.warning.width = leftCanvas.width-30;
        this.warning.changed = true;
		
    },

    undraw: function() {
        this.hGroup.removeChild(this.uiGfx);
        this.rGroup.removeChild(this.uiGfxRight);
        this.uiGfx.removeChild(this.uiGfxRight);
        this.drawn = false;
    },

    setXY: function(gfx, x, y) {
        gfx.x = x;
        gfx.y = y;
    },

    createButton: function(x, y, color, key, text, font, onClick) {
        var width = 45, height = 40;
        var button = new PIXI.Container();
		button.position.set(x,y);
		var colorBacking = new PIXI.Graphics().beginFill(color,1).lineStyle(1,color,1).drawRoundedRect(0, 0, width, height, 6);
		colorBacking.alpha = 0.1;
		button.addChild(colorBacking);
		button.addChild(new PIXI.Graphics().lineStyle(2,color,1).drawRoundedRect(0, 0, width, height, 6));
		var keyText = new PIXI.Text(key, {fill:0xFFFFFF, font:font });
		keyText.position.set((width - keyText.width)/2, 6);
        button.addChild(keyText);
        var nameText = new PIXI.Text(text, {fill:0xFFFFFF, fontWeight:"bold", fontSize:"8pt", fontFamily:"arial" });
		nameText.position.set((width - nameText.width)/2, 27);
		button.addChild(nameText);
		var clickableFace = new PIXI.Sprite(this.lApp.renderer.generateTexture(new PIXI.Graphics().beginFill(0,0).drawRoundedRect(0, 0, width, height, 5)));
		clickableFace.interactive = true;
        clickableFace.on("click",function() {
            onClick.call(button);
            clearTimeout(world.torpFireTimeout);
			hud.uiElementWasJustClicked = setTimeout(function() { hud.uiElementWasJustClicked = null; }, 10);
			console.log(hud.uiElementWasJustClicked);
        });
		button.addChild(clickableFace);
        return button;
    },

    showDPadCommands: function(buttonNum) {
        var commands = this.dPadCommands[buttonNum];
        this.dPadUp.text = commands[0];
        this.dPadRight.text = commands[1];
        this.dPadDown.text = commands[2];
        this.dPadLeft.text = commands[3];
        this.uiGfx.addChild(this.dPadMap);
        this.dPadMap.changed = true;
    },
    hideDPadCommands: function() {
        this.uiGfx.removeChild(this.dPadMap);
    },

    showDirectionWheel: function(show) {
        if(show) { this.uiGfx.addChild(this.directionWheel); }
        else { this.uiGfx.removeChild(this.directionWheel); }
    },
    showWeaponNeedle: function(show) {
        if(show) { this.directionWheel.addChild(this.weaponNeedle); }
        else { this.directionWheel.removeChild(this.weaponNeedle); }
    },
    showDirectionNeedle: function(show) {
        if(show) { this.directionWheel.addChild(this.directionNeedle); }
        else { this.directionWheel.removeChild(this.directionNeedle); }
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
        this.shieldButton.children[0].alpha = shieldsUp?1:0.1;
    },
    setCloakIndic: function(cloakUp) {
        this.cloakButton.children[0].alpha = cloakUp?1:0.1;
    },
    setRepairIndic: function(repairUp) {
        this.repairButton.children[0].alpha = repairUp?1:0.1;
    },
    setOrbitIndic: function(orbit) {
        this.orbitButton.children[0].alpha = orbit?1:0.1;
        if(orbit) {
            this.uiGfxRight.addChild(this.dropButton);
            this.uiGfxRight.addChild(this.pickupButton);
            this.uiGfxRight.addChild(this.bombButton);
        } else {
            this.uiGfxRight.removeChild(this.dropButton);
            this.uiGfxRight.removeChild(this.pickupButton);
            this.uiGfxRight.removeChild(this.bombButton);
       }
    },
    setBombIndic: function(bomb) {
        this.bombButton.children[0].alpha = bomb?1:0.1;
    },
    setPressorIndic: function(pressor) {
        this.pressorButton.children[0].alpha = pressor?1:0.1;
    },
    setTractorIndic: function(tractor) {
        this.tractorButton.children[0].alpha = tractor?1:0.1;
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

        msg = msg.replace(/Helmsman:\s+/, "").replace(/,? captain!/, "!").replace(/\x00/g, "");

        var self = this;
        this.warning.visible = true;
        this.warningText.text = msg;
        this.warning.changed = true;
        if(this.warningTimeout) { clearTimeout(this.warningTimeout); }
        this.warningTimeout = setTimeout(function() { self.hideWarning(); }, 4000);
    },
    hideWarning: function(msg) {
        this.warning.visible = false;
        this.warning.changed = true;
        this.warningTimeout = null;
    },
    showShieldLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
        this.healthMeter.removeChild(this.shieldMeter);
		this.shieldMeter.removeChild(this.shieldText);
		this.shieldMeter = new PIXI.Graphics().lineStyle(30,0x33AAFF,1).arc(0, 0, 28, 0, percent/100 * Math.PI);
		this.shieldMeter.rotation = -3*Math.PI/4;
        this.shieldText.text = Math.floor(percent).toString();
		
		this.shieldMeter.addChild(this.shieldText);
		this.healthMeter.addChildAt(this.shieldMeter, 0);
		this.reposition();
    },
    showHullLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
		var parent = this.damageMeter.parent,
		    index = parent.children.indexOf(this.damageMeter);
		parent.removeChild(this.damageMeter);
        this.damageMeter = new PIXI.Graphics().lineStyle(29,0xAA0000,1).arc(0, 0, 15, 0, -(100-percent)/98 * Math.PI, true);
		this.damageMeter.rotation = Math.PI/150;
		parent.addChildAt(this.damageMeter, index);
        this.damageText.text = Math.floor(percent).toString();
    },
    showFuelLevel: function(percent) {
        var percent = Math.max(0,Math.min(100,percent));
        var level = 60 * Math.pow(percent/100, 0.9);
        var parent = this.fuelMeter.parent,
            index = parent.children.indexOf(this.fuelMeter);
        parent.removeChild(this.fuelMeter);
        this.fuelMeter = new PIXI.Graphics().beginFill(0xFF7700).drawPolygon([0,0,0,-level,60-level,-level,60,0]);
        parent.addChildAt(this.fuelMeter, index);
        this.fuelText.text = Math.floor(percent).toString() + "%";
    },
    showSpeed: function(speed) {
        var frac = Math.pow(speed/12, 0.75);
        this.speedMeter.removeChild(this.meter);
		
        this.meter = new PIXI.Graphics().beginFill(0x00FF00).drawPolygon([20,0, 0,0, 0,-frac*300, 20 + frac*30, -frac*300]);
        this.speedMeter.addChild(this.meter);

        this.smallModeCurrentSpeed.text = speed;

        if(speed) { this.speedNumber.text = "Warp " + speed; }
        else { this.speedNumber.text = ""; }
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
        this.etempMeter.removeChild(this.etempBar);
        this.etempBar = new PIXI.Graphics().beginFill(0xFFFF00).drawPolygon([0,0, 20,0, 20,-y, x,-y]);
        this.etempMeter.addChild(this.etempBar);
        this.etempMeter.changed = true;
    },
    showArmies: function(armies, kills) {
        var maxArmies = Math.min(Math.floor(kills * 2), shipStats[world.player.shipType].maxArmies);

        this.armyText.text = armies + " / " + Math.floor(maxArmies/5);

        if(maxArmies == 0) {
            this.armyText.alpha = 0;
            this.armyGfx.alpha = 0;
        } else {
            this.armyText.alpha = 1;
            this.armyGfx.alpha = 1;
		}
    }
}
