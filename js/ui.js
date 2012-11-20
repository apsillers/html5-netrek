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
    shieldMeter: null,
    shieldText: null,
    damageMeter: null,
    damageText: null,
    fuelMeter: null,
    fuelText: null,
    uiGfx: null,

    init: function(canvas) {
        this.hCanvas = canvas;
        this.uiGfx = new CanvasNode();
 
        this.healthMeter = new CanvasNode();
        this.healthCircle = new Circle(29, {x:45, y:470, fill:"#0A0", stroke:"none", rotation:-3*Math.PI/4, startAngle:0, endAngle:Math.PI});
        this.damageMeter = new Circle(15, {stroke:"#A00", fill:"none", strokeWidth:30, startAngle:0, endAngle:Math.PI});
        this.damageText = new TextNode("100",{fill:"white", rotation:-this.healthCircle.rotation, textAlign:"center", font:"bold 9pt courier", x:0, y:12});
        this.shieldMeter =  new Circle(28, {x:38, y:463, strokeWidth:30, fill:"none", stroke:"#3AF", rotation:-3*Math.PI/4, startAngle:0, endAngle:Math.PI});
        this.shieldText = new TextNode("100",{fill:"white", rotation:-this.shieldMeter.rotation, textAlign:"center", font:"bold 9pt courier", x:20, y:20});
        this.healthMeter.append(this.shieldMeter);
        this.healthMeter.append(this.healthCircle);
        this.healthCircle.append(this.damageMeter);
        this.healthCircle.append(this.damageText);
        this.shieldMeter.append(this.shieldText);
        this.uiGfx.append(this.healthMeter);

        this.fuelBox = new Polygon([0,0,0,-60,60,0],{x:4,y:495,stroke:"#FFF",strokeWidth:0, fill:"none", borderRadius:5});
        this.fuelMeter = new Polygon([0,0,0,-60,60,0], {fill:"#F70", stroke:"none"});
        this.fuelText = new TextNode("100",{y:-10,x:15,textAlign:"center",fill:"white",font:"bold 9pt courier"});
        this.fuelBox.append(this.fuelMeter);
        this.fuelBox.append(this.fuelText);
        this.uiGfx.append(this.fuelBox);

        this.maxSpeed = 12;
        this.speedMeter = new Polygon([0,0, 0,-300, 50,-300], {x:20, y:350, fill:"none", stroke: "white", strokeWidth:2});
        this.meter = new Rectangle(0,0);
        this.speedPointer = new Polygon([-2,0, -9,-3, -9,3], {fill:"none", stroke: "white", strokeWidth:1});
        this.speedMeter.append(this.meter);
        this.speedMeter.append(this.speedPointer);
        this.uiGfx.append(this.speedMeter);

        this.speedNotches = [];
        for(var i=0; i<12; ++i) {
            var frac = Math.pow(i/12, 0.75);
            this.speedNotches[i] = new Line(0,-frac*300, frac*50,-frac*300, { opacity:0.4 });
            this.speedMeter.append(this.speedNotches[i]);
        }

        this.speedMeter.addEventListener("click", function(e) {
            var y = -e.clientY + $(e.target).offset().top + hud.speedMeter.y;
            var speed = Math.ceil(12 * Math.pow(y/300,1/0.75));
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
            e.stopPropagation();
            clearTimeout(world.torpFireTimeout);
        });

        this.etempMeter = new Polygon([0,0, 20,0, 20,-100], {x:30, y:350, fill:"none", stroke: "#AAA", strokeWidth:2});
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

        this.warning = new Rectangle(this.hCanvas.width-50,25, {x: 25, y: 15, stroke:"#F00", fill: "#F44", opacity:0 });
        this.warningText = new TextNode("", {fill:"white", y:15, x:5, font:"bold 10pt courier"});
        this.warning.append(this.warningText);
        this.uiGfx.append(this.warning);
        this.warningTimeout = null;
    },

    draw: function() {
        this.hCanvas.append(this.uiGfx);
    },

    undraw: function() {
        this.hCanvas.removeChild(this.uiGfx);
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

        msg = msg.replace(/Helmsman:\s+/, "");

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
    },
    showSpeedPointer: function(speed) {
        if(speed > this.maxSpeed) { speed = this.maxSpeed; }
        this.speedPointer.y = -300 * Math.pow(speed/12, 0.75);
        this.speedPointer.changed = true;
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
