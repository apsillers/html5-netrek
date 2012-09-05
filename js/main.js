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

// used to start the game
window.addEventListener("load", function() {
    // make canvas and world
    leftCanvas = new Canvas(document.getElementById("leftCanvas"), 500, 500, {
        fill: 'black'
    });
    rightCanvas = new Canvas(document.getElementById("rightCanvas"), 500, 500, {
        fill: 'black'
    });

    outfitting.init(leftCanvas, rightCanvas);
    world.init(leftCanvas, rightCanvas);
    hud.init(leftCanvas);

    imageLib.loadAll();

    //$("#overlay").height($(document).height());
    $("#overlay").width("100%");
    $("#login-box").css("left", ($("html").width() - $("#login-box").width()) / 2);
    $(window).resize(function() {
        $("#overlay").height($(window).height());
        $("#login-box").css("left", ($("html").width() - $("#login-box").width()) / 2);
    });
    $(window).scroll(function() {
        $("#overlay").css("top",$(window).scrollTop()+"px");
        $("#login-box").css("top",$(window).scrollTop()+100+"px");
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
                net.sendArray(CP_LOGIN.data(0,user,pass,"webtest"));
                $("#overlay").hide();
                $("#login-box").hide();
            })
        });
    });
});
