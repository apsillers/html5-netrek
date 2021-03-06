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



    Singleton for drawing the outfitting menu
*/
var SC=0, DD=1, CA=2, BB=3, AS=4, SB=5;
outfitting = {
    canvasWidth: 0,
    canvasHeight: 0,
    smallRaceButtonDim: 70,
    raceButtonDim: 96,
    shipButtonDim: 70,
    shipButtonDimY: 40,
    oCanvas: null,
    infoBox: null,
    raceButtons: [],
    shipButtons: [],
    otherElems: [],
    selectedShip: CA,
    mask: [],
    defaultInfoText: ["Select a ship, then choose a race to","enter the game.","","New players should try a Cruiser first.","",""],
    drawn: false,

    /* Add a race button to the canvas and return its cake.js object. */
    makeRaceButton: function(txt, longtxt, racenum, x, y, fg, bg) {
        var _self = this;
        this._netrekDisabled = false;
        var desc = ["Your race sets your team alligience and", "your home planet (for refit & respawn).","","Each ship class is identical across all","races, e.g., a Klingon Scout is just","as good as a Federation one."];
        var button = new Rectangle(this.raceButtonDim, this.raceButtonDim, {x:x, y:y, rx:10, ry:10, strokeWidth:2, stroke: fg, fill:bg});
        button.append(new TextNode(txt, {y:30, x:this.raceButtonDim/2, fill: fg, font: "bold 20pt Courier", textAlign:"center"}));
        button.append(new TextNode(longtxt, {y:this.raceButtonDim-15, x:this.raceButtonDim/2, fill: fg, font: "bold 11pt Courier", textAlign:"center"}));
        button.addEventListener("mouseover",function(){ _self.showInfoText(desc); });
        button.addEventListener("mouseout",function(){ _self.showInfoText(_self.defaultInfoText); });
        button.addEventListener("click",function(){
            //alert("is this disabled: " + !!this._netrekDisabled);
            if(!this._netrekDisabled) {
                world.player.setImage(imageLib.images[racenum][_self.selectedShip]); 
                world.player.setTeam(racenum);
                net.sendArray(CP_UPDATES.data(UPDATE_RATE));
                setTimeout(function() { net.sendArray(CP_OUTFIT.data(teamLib.teamNumber(racenum), _self.selectedShip)) }, 500);
                //alert("sent data");
            }
        });
        return button;
    },

    /* Add a ship button to the canvas and return its cake.js object. */
    makeShipButton: function(txt, shipId, x, y, fg, bg, desc) {
        var _self = this;
        var button = new Rectangle(this.shipButtonDim, this.shipButtonDimY, {x:x, y:y, rx:10, ry:10, strokeWidth:2, stroke: fg, fill:bg});
        button.append(new TextNode(txt, {y:15, x:this.shipButtonDim/2, fill: fg, font: "bold 8pt Courier", textAlign:"center"}));
        button.addEventListener("mouseover",function(){ _self.showInfoText(desc); });
        button.addEventListener("mouseout",function() { _self.showInfoText(_self.defaultInfoText); });
        button.addEventListener("click",function() { _self.selectShip(shipId); });
        return button;
    },
   
    init: function(canvas, rcanvas) {
        this.oCanvas = canvas;
        this.mCanvas = rcanvas;

        this.canvasWidth = this.oCanvas.width;
        this.canvasHeight = this.oCanvas.height;

        this.motdLines = [];
        this.motdLineNum = 0;

        // add race buttons
        var bufferPx = 10;
        var rightAlignPx = this.canvasWidth - this.raceButtonDim - bufferPx;
        var bottomAlignPx = this.canvasHeight - this.raceButtonDim - bufferPx;
        this.raceButtons.push(this.makeRaceButton("FED", "Federation", teamLib.FED,
                              bufferPx, bottomAlignPx, teamLib.getRaceColor(FED),
                              teamLib.getRaceColor(FED, true)));
        this.raceButtons.push(this.makeRaceButton("ROM", "Romulans", teamLib.ROM,
                              bufferPx, bufferPx, teamLib.getRaceColor(ROM),
                              teamLib.getRaceColor(ROM, true)));

        this.raceButtons.push(this.makeRaceButton("KLI", "Klingons", teamLib.KLI,
                              rightAlignPx, bufferPx, teamLib.getRaceColor(KLI),
                              teamLib.getRaceColor(KLI, true)));
        this.raceButtons.push(this.makeRaceButton("ORI", "Orions", teamLib.ORI,
                              rightAlignPx, bottomAlignPx, teamLib.getRaceColor(ORI),
                              teamLib.getRaceColor(ORI, true)));
 
        // add ship buttons
        var centerPx = (this.canvasWidth - this.shipButtonDim) / 2 - 5;
        var topRowPx = 10;
        var bottomRowPx = this.shipButtonDimY + topRowPx + 5;
        var justLeftPx = centerPx - this.shipButtonDim - 5;
        var justRightPx = centerPx + this.shipButtonDim + 10;
        this.shipButtons[SC] = this.makeShipButton("Scout", SC, justLeftPx,
                                                   topRowPx, "#0FF", "#033",
                               ["Fast and light, the Scout excels at",
                                "dodging enemy fire and rushing behind",
                                "enemy lines to bomb planets.","",
                                "It has weak phasers, but fast torpedos,",
                                "making it fit for long-range fighting."]);
        this.shipButtons[DD] = this.makeShipButton("Destroyer", DD, centerPx,
                                                   topRowPx, "#0FF", "#033",
                               ["The Destroyer is a challenging ship to",
                                "command effectively, but is noted for",
                                "its superior cloaking abilites.","",
                                "Useful for suicide runs on Starbases."]);
        this.shipButtons[CA] = this.makeShipButton("Cruiser", CA, justLeftPx,
                                                   bottomRowPx, "#0FF", "#033",
                               ["A well-balanced ship, favored widely",
                                "by captains of all skill levels.","",
                                "Highly recommended for new players."]);
        this.shipButtons[BB] = this.makeShipButton("Battleship", BB, centerPx,
                                                   bottomRowPx, "#0FF", "#033",
                               ["Slow and powerful, Battleships can take",
                                "a beating, but their powerful weapons",
                                "use up fuel quickly.","",
                                "Excellent for planet defense."]);
        this.shipButtons[AS] = this.makeShipButton("Assult", AS, justRightPx,
                                                   topRowPx, "#0FF", "#033",
                               ["With proper support, the Assult Ship can",
                                "capture planets quite swiftly. It holds",
                                "more armies than any other ship and it",
                                "is an unmatched planet bomber.","",
                                "It also withstands damage very well."]);
        this.shipButtons[SB] = this.makeShipButton("Starbase", SB, justRightPx,
                                                   bottomRowPx, "#0FF", "#033",
                               ["Available only to the most experienced",
                                "players, a Starbase can usually be",
                                "destroyed only by a coordinated effort",
                                "(called 'ogging')."]);
        this.shipButtons[SB].opacity = 0.3;
        this.otherElems.push(this.separator = new Line(justRightPx-5,topRowPx+10,justRightPx-5,
                                      bottomRowPx+this.shipButtonDimY-10,
                                      {stroke:"#0CC", strokeWidth:2}));
       
        this.infoBox = new Rectangle(420, 120, {x:centerPx-210+this.shipButtonDim/2,
                                                y:bottomRowPx+this.shipButtonDimY+20,
                                                rx:10, ry:10, strokeWidth:2,
                                                stroke: "#5FF", fill:"#033"});
        
        //this.otherElems.push(new TextNode("http://www.netrek.org", {textAlign:"center", x:this.canvasWidth/2, y:this.canvasHeight-8, fill:"#FFF", font:"16px Courier"}));
        //this.otherElems.push(new TextNode("Press Tab for a Quick Start guide", {textAlign:"center", x:this.canvasWidth/2, y:18, fill:"#FFF", font:"16px Courier"}));


        this.selectShip(CA);
    },
   
    draw: function() {
        for(var i=0; i<this.raceButtons.length; ++i) {
            this.oCanvas.append(this.raceButtons[i]);
        }

        for(var i=0; i<this.shipButtons.length; ++i) {
            this.oCanvas.append(this.shipButtons[i]);
        } 

        for(var i=0; i<this.otherElems.length; ++i) {
            this.oCanvas.append(this.otherElems[i]);
        } 

        this.showInfoText(this.defaultInfoText);
        this.oCanvas.append(this.infoBox);

        // draw message of the day
        this.writeMotd();

        this.mCanvas.removeChild(hud.uiGfxRight);

        this.drawn = true;
    },

    // used to shift elements when the canvas is resized
    reposition: function() {
        this.canvasWidth = this.oCanvas.canvas.width;
        this.canvasHeight = this.oCanvas.canvas.height;

        var bufferPx = 10;
        var rightAlignPx = this.canvasWidth - this.raceButtonDim - bufferPx;
        var bottomAlignPx = this.canvasHeight - this.raceButtonDim - bufferPx;
        var centerPx = (this.canvasWidth - this.shipButtonDim) / 2 - 5;
        var topRowPx = 20;
        var bottomRowPx = this.shipButtonDimY + topRowPx + 5;
        var justLeftPx = centerPx - this.shipButtonDim - 5;
        var justRightPx = centerPx + this.shipButtonDim + 10;

        var buttonDim = smallMode?this.smallRaceButtonDim:this.raceButtonDim;
        var bufferPx = 10;
        var rightAlignPx = this.canvasWidth - buttonDim - bufferPx;
        var font = "bold " + (smallMode?8:11) + "pt Courier";
        for(var i=0; i<4; ++i) {
            if(i > 1 && smallMode) { this.raceButtons.x = rightAlignPx; }
            this.raceButtons[i].width = buttonDim;
            this.raceButtons[i].height = buttonDim;
            this.raceButtons[i].childNodes[0].x = buttonDim/2;
            this.raceButtons[i].childNodes[1].x = buttonDim/2;
            this.raceButtons[i].childNodes[1].y = buttonDim - 15;
            this.raceButtons[i].childNodes[1].font = font;
            this.raceButtons[i].changed = true;
            this.raceButtons[i].childNodes[0].changed = true;
        }


        this.setXY(this.raceButtons[0], bufferPx, bottomAlignPx);
        this.setXY(this.raceButtons[1], bufferPx, bufferPx);
        this.setXY(this.raceButtons[2], rightAlignPx, bufferPx);
        this.setXY(this.raceButtons[3], rightAlignPx, bottomAlignPx);

        this.setXY(this.shipButtons[SC], justLeftPx, topRowPx);
        this.setXY(this.shipButtons[DD], centerPx, topRowPx);
        this.setXY(this.shipButtons[CA], justLeftPx, bottomRowPx);
        this.setXY(this.shipButtons[BB], centerPx, bottomRowPx);
        this.setXY(this.shipButtons[AS], justRightPx, topRowPx);
        this.setXY(this.shipButtons[SB], justRightPx, bottomRowPx);

        this.infoBox.width = smallMode?270:420;
        this.setXY(this.infoBox, centerPx-this.infoBox.width/2+this.shipButtonDim/2+bufferPx/2, bottomRowPx+this.shipButtonDim+20)
        this.showInfoText(this.defaultInfoText);

        this.separator.x1 = justRightPx-5;
        this.separator.y1 = topRowPx+10;
        this.separator.x2 = justRightPx-5;
        this.separator.y2 = bottomRowPx+this.shipButtonDimY-10;
        this.separator.changed = true;
    },

    setXY: function(gfx, x, y) {
        gfx.x = x;
        gfx.y = y;
        gfx.changed = true;
    },

    undraw: function() {
        this.oCanvas.removeAllChildren();
        this.mCanvas.removeAllChildren();
        this.drawn = false;
    },

    /* respond to SP_MASK packets */
    applyMask: function(mask) {
        this.mask = mask;
        for(var i = 0; i < this.raceButtons.length; ++i) {
            this.raceButtons[i].opacity = 0.15;
            this.raceButtons[i]._netrekDisabled = true;
        }
        for(var i = 0; i < mask.length; ++i) {
            this.raceButtons[teamLib.teamNumber(mask[i])].opacity = 1;
            this.raceButtons[teamLib.teamNumber(mask[i])]._netrekDisabled = false;
        }
    },
   
    showInfoText: function(strArray) {
        this.infoBox.removeAllChildren();
        for(var i=0; i<strArray.length; ++i) {
            this.infoBox.append(new TextNode(strArray[i], {y:(smallMode?13:17)*(i+1)+5, x:10, font:(smallMode?8:12)+"pt Courier", fill: this.infoBox.stroke}));
        }
    },
   
    /* Record the ship type as the selected ship and set the UI to show the ship as selected */
    selectShip: function(shipId) {
        // you cannot select the starbase
        if(shipId == SB) { return; }
   
        var oldButton = this.shipButtons[this.selectedShip];
        if(oldButton) {
            oldButton.stroke = "#0FF";
            oldButton.strokeWidth = 2;
            oldButton.fill = "#033";
        }
        this.selectedShip = shipId;
        var newButton = this.shipButtons[this.selectedShip]
        newButton.stroke = "#F0F";
        newButton.strokeWidth = 4;
        newButton.fill = "#404";
    },

    motdLine: function(line) {
        this.motdDataMode = this.motdDataMode || line.match("@@@");

        if(!this.motdDataMode) {
            this.motdString = this.motdString || [];
            this.motdString.push(line/*.replace(/\x00/g, "")*/);
        } else {
            this.motdData = this.motdData || "";
            this.motdData += line;
        }
    },
    writeMotd: function() {
        var motdLineNum = 0;
        while(motdLineNum < this.motdString.length) {
            var line = this.motdString[motdLineNum];
            this.mCanvas.appendChild(new TextNode(line, {x: 3, y: motdLineNum*12 + 12, fill:"white", font:"7pt Courier"}));
            motdLineNum++;
        }
        while(this.motdData.length > 0) {
            var line = this.motdData.substr(0,80);
            this.mCanvas.appendChild(new TextNode(line, {x: 3, y: motdLineNum*12 + 12, fill:"white", font:"7pt Courier"}));
            this.motdData = this.motdData.substr(80);
            motdLineNum++;
        }
    }
}

