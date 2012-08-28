// used to start the game
window.addEventListener("load", function() {
    // make canvas and world
    leftCanvas = new Canvas(document.getElementById("leftCanvas"), 500, 500, {
        fill: 'black'
    });
    rightCanvas = new Canvas(document.getElementById("rightCanvas"), 300, 300, {
        fill: 'black'
    });

    outfitting.init(leftCanvas);
    world.init(leftCanvas, rightCanvas);
    hud.init(leftCanvas);

    imageLib.loadAll();

    $("#overlay").height($("html").height());
    $("#overlay").width($("html").width());
    $("#login-box").css("left", ($("html").width() - $("#login-box").width()) / 2);
    $(window).resize(function() {
        $("#overlay").height($("html").height());
        $("#login-box").css("left", ($("html").width() - $("#login-box").width()) / 2);
    });

    // if this is a dev server, default to localhost
    if(location.hostname == "localhost" || location.hostname == "127.0.0.1") {
        $("#nt-host-input").val("localhost");
    }


    $("#connect-button").click(function() {
        var nt_host = $("#nt-host-input").val(),
            user = $("#username-input").val(),
            pass = $("#pass-input").val();

        net = new NetrekConnection(location.hostname, location.port||80, function() {
            console.log("proxy connection formed");
            net.connectToServer(nt_host,2592,function(){ //continuum.us.netrek.org
                console.log("NT server connection formed");
                net.sendArray(CP_LOGIN.data(0,user,pass,"hello world"));
                $("#overlay").hide();
                $("#login-box").hide();
                outfitting.draw();
            })
        });
    });
});
