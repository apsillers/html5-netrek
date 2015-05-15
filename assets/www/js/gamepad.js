window.requestAnimationFrame = 
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame;
navigator.getGamepads =
    navigator.getGamepads       ||
    navigator.webkitGetGamepads ||
    navigator.mozGetGamepads;

gamepad = {
    reading: false,
    lastL1: 0,
    lastL2: 0,
    lastR1: 0,
    lastR2: 0,
    lastPad: null,
    pad: null,
    init: function() {
        
    },
    startReading: function() {
        if(navigator.getGamepads == undefined) return;
        var _self = this;
        this.reading = true;
        this.lastPad = new this.ControllerState(navigator.getGamepads()[0]);
        requestAnimationFrame(function() { _self.readControls.call(_self); });
    },
    stopReading: function() {
        this.reading = false;
    },

    
    readControls: function() {
        // if reading was stopped, halt now
        if(!this.reading) { return; }
        var _self = this;

        window.requestAnimationFrame(function() { _self.readControls.call(_self); });

        var pad = _self.pad = new this.ControllerState(navigator.getGamepads()[0]);
        if(!pad.valid) { return; }
        var lastPad = _self.lastPad;
        
        var showWheel = false;

        if(Math.abs(pad.leftStickX) > 0.7 || Math.abs(pad.leftStickY) > 0.7) {
            var showWheel = true;
            var angle = world.getAngleFromJoystick(pad.leftStickX, pad.leftStickY);
            net.sendArray(CP_DIRECTION.data(world.rad2byte(angle)));
            hud.showDirectionNeedle(true);
            hud.showDirectionAngle(angle);
        } else {
            hud.showDirectionNeedle(false);
        }

        if(Math.abs(pad.rightStickX) > 0.7 || Math.abs(pad.rightStickY) > 0.7) {
            var angle = world.getAngleFromJoystick(pad.rightStickX, pad.rightStickY);
            showWheel = true;
            hud.showWeaponNeedle(true);
            hud.showWeaponAngle(angle);
        } else {
            hud.showWeaponNeedle(false);
        }

        hud.showDirectionWheel(showWheel);

        if(pad.l1 < 0.5 && lastPad.l1 >= 0.5) {
            var speed = hud.targetSpeed + 1;
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
        }
        if(pad.l2 < 0.5 && lastPad.l2 >= 0.5) {
            var speed = hud.targetSpeed - 1;
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
        }

        if(pad.r1 < 0.5 && lastPad.r1 >= 0.5) {
            net.sendArray(CP_TORP.data(world.rad2byte(world.getAngleFromJoystick(pad.rightStickX, pad.rightStickY))));
        }
        if(pad.r2 < 0.5 && lastPad.r2 >= 0.5) {
            net.sendArray(CP_PHASER.data(world.rad2byte(world.getAngleFromJoystick(pad.rightStickX, pad.rightStickY))));
        }

        for(var i=0; i<4; ++i) {
            if(pad["faceButton"+(i+1)] > 0.5) {
                hud.showDPadCommands(i);
            }
        }

        if(pad.faceButton1 > 0.5) {
            if(this.justReleased("dPadRight")) { net.sendArray(CP_ORBIT.data(world.player.orbitting?0:1)); }
            else if(this.justReleased("dPadLeft")) { net.sendArray(CP_BOMB.data(world.player.bombing?0:1)); }
            else if(this.justReleased("dPadDown")) { net.sendArray(CP_BEAM.data(2)); }
            else if(this.justReleased("dPadUp")) { net.sendArray(CP_BEAM.data(1)); }
        } else if(pad.faceButton2 > 0.5) {
            if(this.justReleased("dPadRight")) { net.sendArray(CP_ORBIT.data(world.player.orbitting?0:1)); }
            else if(this.justReleased("dPadLeft")) { net.sendArray(CP_BOMB.data(world.player.bombing?0:1)); }
            else if(this.justReleased("dPadDown")) { net.sendArray(CP_BEAM.data(2)); }
            else if(this.justReleased("dPadUp")) { net.sendArray(CP_BEAM.data(1)); }
        } else if(pad.faceButton3 > 0.5) {
            if(this.justReleased("dPadRight")) { net.sendArray(CP_SHIELD.data(world.player.shields?0:1)); }
            else if(this.justReleased("dPadLeft")) { net.sendArray(CP_CLOAK.data(world.player.cloaked?0:1)); }
            else if(this.justReleased("dPadDown")) {  }
            else if(this.justReleased("dPadUp")) { net.sendArray(CP_REPAIR.data(1)); }
        } else if(pad.faceButton4 > 0.5) {
            if(this.justReleased("dPadRight")) { net.sendArray(CP_DET_TORPS.data()); }
            else if(this.justReleased("dPadLeft")) {
                var baseTorpIndex = world.player.number * 8;
                for(var i=0; i < 8; ++i) {
                    net.sendArray(CP_DET_MYTORP.data(baseTorpIndex + i));
                }
            }
            else if(this.justReleased("dPadDown")) {  }
            else if(this.justReleased("dPadUp")) {  }
        } else {
            hud.hideDPadCommands();
        }

        _self.lastPad = pad;
    },

    ControllerState: function(pad) {
        if(pad == undefined) return undefined;

        this.valid = true;

        // madcatz 360 is super weird
        if(pad.id.indexOf("Vendor: 1bad Product: f016") != -1) {
            var mode = "madcatz 360";
        } else {
            var mode = "standard";
        }

        // axes are spec-correct
        // button is off-spec, should be 10
        this.leftStickX = pad.axes[0];
        this.leftStickY = pad.axes[1];
        if(mode == "madcatz 360") {
            this.leftStickButton = pad.buttons[9];
        } else {
            this.leftStickButton = pad.buttons[10];
        }

        // off-spec: should be axes 2 and 3 and button 11
        if(mode == "madcatz 360") {
            this.rightStickX = pad.axes[3];
            this.rightStickY = pad.axes[4];
            this.rightStickButton = pad.buttons[10];
        } else {
            this.rightStickX = pad.axes[2];
            this.rightStickY = pad.axes[3];
            this.rightStickButton = pad.buttons[11];
        }

        // spec-correct
        this.faceButton1 = pad.buttons[0];
        this.faceButton2 = pad.buttons[1];
        this.faceButton3 = pad.buttons[2];
        this.faceButton4 = pad.buttons[3]; 

        // crazy off-spec: dPad should be in buttons, not axes!
        // each is either a 1 or 0
        if(mode == "madcatz 360") {
            this.dPadUp = -pad.axes[7];
            this.dPadDown = pad.axes[7];
            this.dPadLeft = -pad.axes[6];
            this.dPadRight = pad.axes[6];
        } else {
            this.dPadUp = pad.buttons[12];
            this.dPadDown = pad.buttons[13];
            this.dPadLeft = pad.buttons[14];
            this.dPadRight = pad.buttons[15];
        }


        // spec-correct for L1 and R1, but...
        this.l1 = pad.buttons[4];
        this.r1 = pad.buttons[5];

        // L2 and R2 are crazy off-spec: reported as axes ranging from -1 to 1 (unpressed to pressed)
        // they should be buttons, from 0 to 1, so I normalize them
        if(mode == "madcatz 360") {
            this.l2 = (pad.axes[2]+1)/2;
            this.r2 = (pad.axes[5]+1)/2;
        } else {
            this.l2 = pad.buttons[6];
            this.r2 = pad.buttons[7];
        }

        // off-spec? should be button 8?
        // there is no "select" button, so it's hard to say -- this is the "back" button
        if(mode == "madcatz 360") {
             this.selectButton = pad.buttons[6];
        } else {
             this.selectButton = pad.buttons[8];
        }
        // off-spec, should be button 9
        if(mode == "madcatz 360") {
             this.startButton = pad.buttons[7];
        } else {
             this.startButton = pad.buttons[9];
        }
        // spec-correct? as above, there is no "select" button (which is what 8 should be)
        if(mode == "madcatz 360") {
             this.xboxButton = pad.buttons[8];
        } else {
             this.xboxButton = pad.buttons[16];
        }
    
    },
    justReleased: function(name) {
        return this.pad[name] < 0.5 && this.lastPad[name] >= 0.5;
    }
}
