// used to start the game
window.addEventListener("load", function() {
    // make canvas and world
    rightCanvas = new Canvas(document.getElementById("rightCanvas"), 500, 500, {
        fill: 'black'
    });
    leftCanvas = new Canvas(document.getElementById("leftCanvas"), 500, 500, {
        fill: 'black'
    });

    outfitting.init(leftCanvas);
    world.init(leftCanvas, rightCanvas);
    hud.init(leftCanvas);

    imageLib.loadAll();

    net = new NetrekConnection(location.hostname, location.port||80, function() {
        net.connectToServer("continuum.us.netrek.org",2592,function(){ //continuum.us.netrek.org
            net.sendArray(CP_LOGIN.data(0,"guest","","hello world"));
            outfitting.draw();
        })
    });
});
