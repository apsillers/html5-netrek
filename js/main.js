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

        var connected_yet = false;
        var creds = {};

// used to start the game
window.addEventListener("load", function() {
    var lCanvas = document.getElementById("leftCanvas"),
        rCanvas = document.getElementById("rightCanvas")

    // make canvas and world
    leftCanvas = new Canvas(lCanvas, $(lCanvas).data("width"), $(lCanvas).data("height"), {
        fill: 'black'
    });
    rightCanvas = new Canvas(rCanvas, $(rCanvas).data("width"), $(rCanvas).data("height"), {
        fill: 'black'
    });

    outfitting.init(leftCanvas, rightCanvas);
    world.init(leftCanvas, rightCanvas);
    hud.init(leftCanvas, rightCanvas);

    $("#loading-box").css("left", ($("html").width() - $("#loading-box").width()) / 2);
    $("#loading-box").html("<h1>Loading...</h1>");

    imageLib.loadAll(function() {
        net = new NetrekConnection(location.hostname, location.port||80, function() {
            net.getServerList(function(serverList) {
                $("#loading-box").hide();
                $("#login-box").show();

                $("#overlay").width("100%");
                $("#overlay").css("top",$(window).scrollTop()+"px");
                $("#overlay").css("left",$(window).scrollLeft()+"px");
                $("#login-box").css("top",$(window).scrollTop()+100+"px");
                $("#login-box").css("left",($("html").width() - $("#login-box").width()) / 2 + $(window).scrollLeft());

                $(window).resize(function() {
                    $("#overlay").height($(window).height());
                    $("#login-box").css("left", ($("html").width() - $("#login-box").width()) / 2);
                });
                $(window).scroll(function() {
                    $("#overlay").css("top",$(window).scrollTop()+"px");
                    $("#overlay").css("left",$(window).scrollLeft()+"px");
                    $("#login-box").css("top",$(window).scrollTop()+100+"px");
                    $("#login-box").css("left",($("html").width() - $("#login-box").width()) / 2 + $(window).scrollLeft());
                });

                document.getElementById("connect-button").focus();

                for(var i = 0; i < serverList.length; ++i) {
                    $("#nt-host-input").append($("<option></option>").text(serverList[i].host));
                }

                // if this is a dev server, default to localhost
                if(location.hostname == "localhost" || location.hostname == "127.0.0.1") {
                    $("#nt-host-input").append("<option>localhost</option>").val("localhost");
                }


                $("#chatbox").bind("mouseover", function() {
                    $("#chatbox").css("top","-200px").height(398);
                    $("#inbox").height(370);
                });

                $("#chatbox").bind("mouseout", function() {
                    $("#chatbox").css("top","0px").height(198);
                    $("#inbox").height(170);
                    $("#inbox").scrollTop($("#inbox")[0].scrollHeight);
                });

                $("#connect-button").click(function() {
                    var nt_host = $("#nt-host-input").val(),
                        user = $("#username-input").val(),
                        pass = $("#pass-input").val();

                    $("#login-box").html("<h2>Connecting...</h2>");

                    net.connectToServer(nt_host,2592,function(){
                        console.log("NT server connection formed");
                        net.sendArray(CP_LOGIN.data(0,user,pass,"html5test"));

                        $(document).bind("keyup", function (e) {
                                if(e.keyCode == 9) {
                                    $("#quickstart").hide();
                                }
                        });

                        $(document).bind("keydown", function (e) {
                                if(e.keyCode == 9) {
                                    $("#quickstart").show();
                                    e.preventDefault();
                                }
                        });

                        // send an idempotent CP_UPDATES request every 10 seconds to save us from being ghostbusted when the player idles
                        // TODO: get ping working instead!
                        setInterval(function() { net.sendArray(CP_UPDATES.data(UPDATE_RATE)); }, 10000);

                        // if there was a one-time error talking to server, start the protocol over again
                        // (this sometimes happens if the server/proxy hasn't had traffic for a while and it doesn't seem to "wake up" in time)
                        setTimeout(function() {
                            if(!connected_yet) {
                                net.sendArray(CP_LOGIN.data(0,user,pass,"html5test"));
                            }
                        }, 5000);
                    });
                });
            });
        });
    });
});
