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

outfitting = {
    canvasWidth: 0,
    canvasHeight: 0,
    smallRaceButtonDim: 86,
    raceButtonDim: 96,
    shipButtonDim: 70,
    shipButtonDimY: 40,
    oCanvas: null,
    infoBox: null,
	oGroup: new PIXI.Container(),
	mGroup: new PIXI.Container(),
    raceButtons: [],
    shipButtons: [],
    otherElems: [],
    selectedShip: CA,
    mask: [],
    defaultInfoText: ["Select a ship, then choose a race to","enter the game.","","New players should try a Cruiser first.","",""],
    drawn: false,

    /* Add a race button to the canvas and return its cake.js object. */
    makeRaceButton: function(txt, longtxt, racenum, x, y, fg, bg) {
		var Text = PIXI.Text;
        var _self = this;
        this._netrekDisabled = false;
        var desc = ["Your race sets your team alligience and", "your home planet (for refit & respawn).","","Each ship class is identical across all","races, e.g., a Klingon Scout is just","as good as a Federation one."];
        var button = new PIXI.Graphics().lineStyle(2, fg, 1).beginFill(bg).drawRoundedRect(0, 0, this.raceButtonDim, this.raceButtonDim, 10).endFill();
		button.position.set(x,y);
		var raceTitle = new Text(txt, {fill: fg, fontWeight:"bold", fontSize:"20pt", fontFamily:"Courier" });
		raceTitle.position.set(this.raceButtonDim/2 - raceTitle.width/2, 30);
		var raceName = new Text(longtxt, {fill: fg, fontWeight:"bold", fontSize:"11pt", fontFamily:"Courier" });
		raceName.position.set(this.raceButtonDim/2 - raceName.width/2, this.raceButtonDim-20);
        button.addChild(raceTitle);
        button.addChild(raceName);
		
		button = new PIXI.Sprite(button.generateTexture());
		button.interactive = true;
		
        button.on("mouseover",function(){ _self.showInfoText(desc); });
        button.on("mouseout",function(){ _self.showInfoText(_self.defaultInfoText); });
        button.on("click",function(){
            //alert("is this disabled: " + !!this._netrekDisabled);
            if(!this._netrekDisabled) {
                world.player.setImage(imageLib.getTexture(racenum, _self.selectedShip)); 
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
		var button = new PIXI.Graphics().lineStyle(2, fg, 1).beginFill(bg).drawRoundedRect(0, 0, this.shipButtonDim, this.shipButtonDimY, 10).endFill();
		button.position.set(x,y);
		var text = new PIXI.Text(txt, {fill: fg, fontWeight: "bold", fontSize:"8pt", fontFamily:"Courier", textAlign:"center"});
		text.position.set(this.shipButtonDim/2 - text.width/2, 15);
        button.addChild(text);
		
		button = new PIXI.Sprite(button.generateTexture());
		button.interactive = true;
		
        button.on("mouseover",function(){ _self.showInfoText(desc); });
        button.on("mouseout",function() { _self.showInfoText(_self.defaultInfoText); });
        button.on("click",function() { _self.selectShip(shipId); });
        return button;
    },
   
    init: function(app, rApp) {
        this.oCanvas = app.view;
        this.mCanvas = rApp.view;
		this.lGroup = app.stage;
		this.rGroup = rApp.stage;

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
                                                   topRowPx, 0x00FFFF, 0x003333,
                               ["Fast and light, the Scout excels at",
                                "dodging enemy fire and rushing behind",
                                "enemy lines to bomb planets.","",
                                "It has weak phasers, but fast torpedos,",
                                "making it fit for long-range fighting."]);
        this.shipButtons[DD] = this.makeShipButton("Destroyer", DD, centerPx,
                                                   topRowPx, 0x00FFFF, 0x003333,
                               ["The Destroyer is a challenging ship to",
                                "command effectively, but is noted for",
                                "its superior cloaking abilites.","",
                                "Useful for suicide runs on Starbases."]);
        this.shipButtons[CA] = this.makeShipButton("Cruiser", CA, justLeftPx,
                                                   bottomRowPx, 0x00FFFF, 0x003333,
                               ["A well-balanced ship, favored widely",
                                "by captains of all skill levels.","",
                                "Highly recommended for new players."]);
        this.shipButtons[BB] = this.makeShipButton("Battleship", BB, centerPx,
                                                   bottomRowPx, 0x00FFFF, 0x003333,
                               ["Slow and powerful, Battleships can take",
                                "a beating, but their powerful weapons",
                                "use up fuel quickly.","",
                                "Excellent for planet defense."]);
        this.shipButtons[AS] = this.makeShipButton("Assult", AS, justRightPx,
                                                   topRowPx, 0x00FFFF, 0x003333,
                               ["With proper support, the Assult Ship can",
                                "capture planets quite swiftly. It holds",
                                "more armies than any other ship and it",
                                "is an unmatched planet bomber.","",
                                "It also withstands damage very well."]);
        this.shipButtons[SB] = this.makeShipButton("Starbase", SB, justRightPx,
                                                   bottomRowPx, 0x00FFFF, 0x003333,
                               ["Available only to the most experienced",
                                "players, a Starbase can usually be",
                                "destroyed only by a coordinated effort",
                                "(called 'ogging')."]);
        this.shipButtons[SB].opacity = 0.3;

		this.separator = new PIXI.Graphics().lineStyle(2,0x00CCCC,1).moveTo(0,0).lineTo(0,60);
		this.separator.position.set(justRightPx - 4, topRowPx + 10);
        this.otherElems.push(this.separator);
       
	    this.infoBox = new PIXI.Graphics().lineStyle(2, 0x55FFFF, 1).beginFill(0x003333).drawRoundedRect(0, 0, 420, 120, 10).endFill();
		this.infoBox.position.set(centerPx-210+this.shipButtonDim/2, bottomRowPx+this.shipButtonDimY+20);
        
        //this.otherElems.push(new TextNode("http://www.netrek.org", {textAlign:"center", x:this.canvasWidth/2, y:this.canvasHeight-8, fill:"#FFF", font:"16px Courier"}));
        //this.otherElems.push(new TextNode("Press Tab for a Quick Start guide", {textAlign:"center", x:this.canvasWidth/2, y:18, fill:"#FFF", font:"16px Courier"}));

        for(var i=0; i<this.raceButtons.length; ++i) {
            this.oGroup.addChild(this.raceButtons[i]);
        }

        for(var i=0; i<this.shipButtons.length; ++i) {
            this.oGroup.addChild(this.shipButtons[i]);
        } 

        for(var i=0; i<this.otherElems.length; ++i) {
            this.oGroup.addChild(this.otherElems[i]);
        } 

        this.showInfoText(this.defaultInfoText);
        this.oGroup.addChild(this.infoBox);

		this.selectShip(CA);
    },
   
    draw: function() {
		this.lGroup.addChild(this.oGroup);
		this.rGroup.addChild(this.mGroup);

		// draw message of the day
        this.writeMotd();
		
        this.drawn = true;
    },

    // used to shift elements when the canvas is resized
    reposition: function() {
        this.canvasWidth = this.oCanvas.width;
        this.canvasHeight = this.oCanvas.height;

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
        /*for(var i=0; i<4; ++i) {
            if(i > 1 && smallMode) { this.raceButtons.x = rightAlignPx; }
            this.raceButtons[i].width = buttonDim;
            this.raceButtons[i].height = buttonDim;
            this.raceButtons[i].children[0].x = buttonDim/2 - this.raceButtons[i].children[0].width/2;
            this.raceButtons[i].children[1].x = buttonDim/2 - this.raceButtons[i].children[1].width/2;
            this.raceButtons[i].children[1].y = buttonDim - 20;
            this.raceButtons[i].children[1].font = font;
            this.raceButtons[i].children[0].changed = true;
        }*/


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

        this.separator.position.set(justRightPx-4, topRowPx+10);
    },

    setXY: function(gfx, x, y) {
        gfx.x = x;
        gfx.y = y;
        gfx.changed = true;
    },

    undraw: function() {
        this.lGroup.removeChildren();
        this.rGroup.removeChildren();
        this.drawn = false;
    },

    /* respond to SP_MASK packets */
    applyMask: function(mask) {
        this.mask = mask;
        for(var i = 0; i < this.raceButtons.length; ++i) {
            this.raceButtons[i].alpha = 0.2;
            this.raceButtons[i]._netrekDisabled = true;
        }
        for(var i = 0; i < mask.length; ++i) {
            this.raceButtons[teamLib.teamNumber(mask[i])].alpha = 1;
            this.raceButtons[teamLib.teamNumber(mask[i])]._netrekDisabled = false;
        }
    },
   
    showInfoText: function(strArray) {
        this.infoBox.removeChildren();
        //for(var i=0; i<strArray.length; ++i) {
			var textLine = new PIXI.Text(strArray.join("\n"), { fontSize:(smallMode?8:12)+"pt", fontFamily:"courier", fill: 0x55FFFF});
			textLine.position.set(10, 5);
			this.infoBox.addChild(textLine);
        //}
    },
   
    /* Record the ship type as the selected ship and set the UI to show the ship as selected */
    selectShip: function(shipId) {
        // you cannot select the starbase
        if(shipId == SB) { return; }

        if(!this.shipSelector) {
            this.shipSelector = new PIXI.Graphics().lineStyle(3, 0xFF00FF, 1).beginFill(0x440044, 0.2).drawRoundedRect(0, 0, this.shipButtonDim, this.shipButtonDimY, 10).endFill();
        } else {
			this.previousShipButton.removeChild(this.shipSelector);
		}
		
        this.selectedShip = shipId;

		var button = this.shipButtons[this.selectedShip];
		button.addChild(this.shipSelector);
		this.previousShipButton = button;
    },

    motdLine: function(line) {
        this.motdDataMode = this.motdDataMode || line.match("@@@");

        if(!this.motdDataMode) {
            this.motdString = this.motdString || [];
            this.motdString.push(line.replace(/\x00/g, " "));
        } else {
            this.motdData = this.motdData || "";
            this.motdData += line;
        }
    },
    writeMotd: function() {
		if(!this.motdGfx) {
			if(this.motdData) {
				while(this.motdData.length > 0) {
					this.motdString.push(this.motdData.substr(0,80));
					this.motdData = this.motdData.substr(80);
				}
			}
			var lines = this.motdString.join("\n");
			this.motdGfx = new PIXI.Text(lines, { fill:"white", fontSize:"7pt", fontFamily:"Courier", lineHeight:12});
			this.mGroup.addChild(this.motdGfx);
		}
    }
}

