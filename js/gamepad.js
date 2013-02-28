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

        var pad = navigator.getGamepads()[0];
        if(pad == undefined) { return; }
        
        var leftStick = [pad.axes[0], pad.axes[1]];
        

        if(Math.abs(leftStick[0]) > 0.1 || Math.abs(leftStick[1]) > 0.1) {
            net.sendArray(CP_DIRECTION.data(world.rad2byte(world.getAngleFromJoystick(leftStick[0], leftStick[1]))));
        }

        if(pad.buttons[4] == 0 && _self.lastL1 == 1) {
            var speed = hud.targetSpeed + 1;
            net.sendArray(CP_SPEED.data(speed));
            hud.showSpeedPointer(speed);
        }

        _self.lastL1 = pad.buttons[4];
        _self.lastPad = pad;
    }
}
