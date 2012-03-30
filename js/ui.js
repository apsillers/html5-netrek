/*
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

        this.healthCircle = new Circle(29,{x:35, y:465, fill:"#0C0",stroke:"none", rotation:Math.PI/2});
        this.shieldMeter = new Circle(35, {stroke:"#3AF", fill:"none",strokeWidth:8, startAngle:0, endAngle:Math.PI, rotation:Math.PI*0.8});
        this.damageMeter = new Circle(15, {stroke:"#A00", fill:"none", strokeWidth:30, startAngle:0, endAngle:0});
        this.damageText = new TextNode("100",{fill:"white", rotation:-Math.PI/2, textAlign:"center", font:"bold 12pt courier", x:-7});
        this.shieldText = new TextNode("100",{fill:"white", rotation:-Math.PI/2, textAlign:"center", font:"bold 12pt courier", x:17});
        this.healthCircle.append(this.damageMeter);
        this.healthCircle.append(this.shieldMeter);
        this.healthCircle.append(this.damageText);
        this.healthCircle.append(this.shieldText);
        this.uiGfx.append(this.healthCircle);

        this.fuelBox = new Rectangle(300,20,{x:100,y:475,stroke:"#D60",strokeWidth:2});
        this.fuelMeter = new Rectangle(200, 20, {fill:"#F70", stroke:"none"});
        this.fuelBox.append(new Circle(10, {startAngle:Math.PI/2, endAngle:-Math.PI/2, y:10, x:-1, fill:"#F70"}));
        this.fuelBox.append(new Circle(10, {startAngle:-Math.PI/2, endAngle:Math.PI/2, y:10, x:300, fill:"#F70", stroke:"none"}));
        this.fuelText = new TextNode("100",{y:15,x:150,textAlign:"center",fill:"white",font:"bold 12pt courier"});
        this.fuelBox.append(this.fuelMeter);
        this.fuelBox.append(this.fuelText);
        this.uiGfx.append(this.fuelBox);

        this.uiGfx.opacity = "0.9";
    },

    draw: function() {
        this.hCanvas.append(this.uiGfx);
    },

    undraw: function() {
        this.hCanvas.removeChild(this.uiGfx);
    },

    showShieldLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent))
        this.shieldMeter.startAngle = (100-percent)/100 * Math.PI
        this.shieldText.text = Math.floor(percent).toString();
    },
    showHullLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent))
        this.damageMeter.endAngle = (100-percent)/100 * Math.PI*2;
        this.damageText.text = Math.floor(percent).toString();
    },
    showFuelLevel: function(percent) {
        percent = Math.max(0,Math.min(100,percent));
        this.fuelMeter.width = percent/100 * 300;
        this.fuelText.text = Math.floor(percent).toString() + "%";
    }
}