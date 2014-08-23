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

// used to start the game
window.addEventListener("load", function() {
    $("#loading-box").html("<h1 style='color: white;'>Loading...</h1>");

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
    tutorial.init($("#tutorial-div")[0], $("#tutorial-tab")[0], $("#tutorial-body")[0]);
    playerList.init($("#playerlist")[0]);
    chat.init($("#chatInput")[0]);
    gamepad.init();

    $("#tutorial-enable-link").click(function() { tutorial.activateTutorial(); });

    imageLib.loadAll(function() {
        net = new NetrekConnection(location.protocol!="http:", location.hostname, location.port || (location.protocol=="https:"?443:80), function() {
            net.getServerList(function(serverList) {
                $("#loading-box").hide();
                $("#login-box").show();

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

                var resizeGame = function() {
                    var minHeight = 440;
                    var minWidth = 1145;

                    var winHeight = Math.max($(window).height(), minHeight);
                    var winWidth = Math.max($(window).width(), minWidth);

                    lCanvas.width = winWidth - $(rCanvas).data("width") + "px";
                    lCanvas.height = winHeight;
                    var container = lCanvas.firstElementChild;
                    var canvas = container.firstElementChild;
                    container.style.width = winWidth - $(rCanvas).data("width") + "px";
                    container.style.height = winHeight + "px";
                    canvas.width = winWidth - $(rCanvas).data("width");
                    canvas.height = winHeight;
                    $("#canvasland").width(winWidth);

                    var chatHeight = winHeight - $(rCanvas).data("height") - 2;
                    $("#chatbox").css("height", chatHeight + "px");
                    $("#inbox").css("height", chatHeight - 30 + "px");
                    $("#inbox").scrollTop($("#inbox")[0].scrollHeight);

                    hud.reposition();
                    outfitting.reposition();
                }
                resizeTimeout = null;
                $(window).resize(function() {
                    if(resizeTimeout) clearTimeout(resizeTimeout);
                    setTimeout(resizeGame, 200);
                });

                // call it once to get started
                resizeGame();

                $("#join-button").click(function() {
                    $("#menu-div").hide();
                    $("#server-choice-div").show();
                    $("#login-error").html("");
                });

                // if this is a dev server, default to localhost
                if(location.hostname == "localhost" || location.hostname == "127.0.0.1") {
                    serverList.push({"host":location.hostname})
                }

                for(var i = 0; i < serverList.length; ++i) {
                    var hostbutton = $("<div class='main-menu-button host-button'></div>").text(serverList[i].host);
                    $.data(hostbutton[0], "data-host", serverList[i].host);
                    $("#list-back-button").before(hostbutton);
                }

                /*$("#chatbox").bind("mouseover", function() {
                    $("#chatbox").css("top","-200px").height(398);
                    $("#inbox").height(370);
                });

                $("#chatbox").bind("mouseout", function() {
                    $("#chatbox").css("top","0px").height(198);
                    $("#inbox").height(170);
                    $("#inbox").scrollTop($("#inbox")[0].scrollHeight);
                });*/

                $(".host-button").click(function() {
                    $("#server-choice-div").hide();
                    $("#credentials-div").show();
                    $("#connect-button").focus();
                    $("#login-error").html("");
                    $("#nt-host-input").val($(this).data("host"));
                });

                $("#tutorial-button").click(function() {
                    tutorial.activateTutorial();
                    tutorial.showTutorialPanel();
                    login(CONFIG.tutorial_server, "guest", "", true);
                });

                $("#credits-button").click(function() {
                    $("#menu-div").hide();
                    $("#credits-div").show();
                });

                $("#credits-back-button").click(function() {
                    $("#menu-div").show();
                    $("#credits-div").hide();
                });

                $("#list-back-button").click(function() {
                    $("#menu-div").show();
                    $("#server-choice-div").hide();
                });

                $("#connect-button").click(function() {
                    login();
                });

                $("#login-back-button").click(function() {
                    $("#credentials-div").hide();
                    $("#server-choice-div").show();
                });

                function login(nt_host_var, user_var, pass_var, isTutorial_var) {
                    var nt_host = nt_host_var || $("#nt-host-input").val(),
                        user = user_var || $("#username-input").val(),
                        pass = pass_var || $("#pass-input").val();
                    var isTutorial = isTutorial_var;

                    $("#login-inner").hide();
                    $("#login-loading").show();

                    net.connectToServer(nt_host,2592,function(success){
                        if(!success) {
                            $("#login-loading").hide();
                            $("#login-inner").show();
                            $("#credentials-div").hide();
                            if(isTutorial) { $("#main-menu-div").show(); }
                            else { $("#server-choice-div").show(); }
                            $("#login-error").html("Could not connect to server.<br/>Try another server from the list.");
                            return;
                        }

                        console.log("NT server connection formed");
                        net.sendArray(CP_LOGIN.data(0,user,pass,"html5test"));

                        $(document).bind("keyup", function (e) {
                                if(e.keyCode == 9) {
                                    $("#playerlist-div").hide();
                                }
                        });

                        $(document).bind("keydown", function (e) {
                                if(e.keyCode == 9 && !e.ctrlKey) {
                                    $("#playerlist-div").show();
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
                }
            });
        });
    });

    $("#loading-box").css("left", ($("html").width() - $("#loading-box").width()) / 2);
    $("#overlay").width("100%");
    $("#overlay").css("top",$(window).scrollTop()+"px");
    $("#overlay").css("left",$(window).scrollLeft()+"px");
});


