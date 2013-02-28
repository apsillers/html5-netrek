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

        var pad = new this.ControllerState(navigator.getGamepads()[0]);
        if(pad == undefined) { return; }
        var lastPad = _self.lastPad;
        
        if(Math.abs(pad.leftStick.x) > 0.5 || Math.abs(pad.leftStick.y) > 0.5) {
            net.sendArray(CP_DIRECTION.data(world.rad2byte(world.getAngleFromJoystick(pad.leftStick.x, pad.leftStick.y))));
        }

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
            net.sendArray(CP_TORP.data(world.rad2byte(world.getAngleFromJoystick(pad.rightStick.x, pad.rightStick.y))));
        }
        if(pad.r2 < 0.5 && lastPad.r2 >= 0.5) {
            net.sendArray(CP_PHASER.data(world.rad2byte(world.getAngleFromJoystick(pad.rightStick.x, pad.rightStick.y))));
        }

        _self.lastPad = pad;
    },

    /**
        XXX: this constructor is written for my MadCatz XBox 360 controller on Linux Chrome
        XXX: It's pretty messed up!
        XXX: I've noted where it deviatates from the spec draft and where it's correct
    **/
    ControllerState: function(pad) {
        if(pad == undefined) return undefined;

        // axes are spec-correct
        // button is off-spec, should be 10
        this.leftStick = { x: pad.axes[0], y: pad.axes[1], button: pad.buttons[9]};

        // off-spec: should be axes 2 and 3 and button 11
        this.rightStick = { x: pad.axes[3], y: pad.axes[4], button: pad.buttons[10] };

        // spec-correct
        this.faceButtons = [pad.buttons[0],pad.buttons[1],pad.buttons[2],pad.buttons[3]]; 

        // crazy off-spec: dPad should be in buttons, not axes!
        // each is either a 1 or 0
        this.dPad = { up: -pad.axes[7], down: pad.axes[7], left: -pad.axes[6], right: pad.axes[6] };

        // spec-correct for L1 and R1, but...
        this.l1 = pad.buttons[4];
        this.r1 = pad.buttons[5];

        // L2 and R2 are crazy off-spec: reported as axes ranging from -1 to 1 (unpressed to pressed)
        // they should be buttons, from 0 to 1, so I normalize them
        this.l2 = (pad.axes[2]+1)/2;
        this.r2 = (pad.axes[5]+1)/2;

        // off-spec? should be button 8?
        // there is no "select" button, so it's hard to say -- this is the "back" button
        this.selectButton = pad.buttons[6];
        // off-spec, should be button 9
        this.startButton = pad.buttons[7];
        // spec-correct? as above, there is no "select" button (which is what 8 should be)
        this.xboxButton = pad.buttons[8];
    
    }
}
