/*
    Singleton for drawing the outfitting menu
*/
var SC=0, DD=1, CA=2, BB=3, AS=4, SB=5;
outfitting = {
    canvasWidth: 500,
    canvasHeight: 500,
    raceButtonDim: 96,
    shipButtonDim: 70,
    oCanvas: null,
    infoBox: null,
    raceButtons: [],
    shipButtons: [],
    otherElems: [],
    selectedShip: CA,
    mask: [],
    defaultInfoText: ["Select a ship, then choose a race to","enter the game.","","","","New players should try a Cruiser first."],

    /* Add a race button to the canvas and return its cake.js object. */
    makeRaceButton: function(txt, longtxt, racenum, x, y, fg, bg) {
        var _self = this;
        var desc = ["Your race sets your team alligience and", "your home planet (for refit & respawn).","","Each ship class is identical across all","races, e.g., a Klingon Scout is just","as good as a Federation one."];
        var button = new Rectangle(this.raceButtonDim, this.raceButtonDim, {x:x, y:y, rx:10, ry:10, strokeWidth:2, stroke: fg, fill:bg});
        button.append(new TextNode(txt, {y:30, x:this.raceButtonDim/2, fill: fg, font: "bold 20pt Courier", textAlign:"center"}));
        button.append(new TextNode(longtxt, {y:this.raceButtonDim-15, x:this.raceButtonDim/2, fill: fg, font: "bold 11pt Courier", textAlign:"center"}));
        button.addEventListener("mouseover",function(){ _self.showInfoText(desc); });
        button.addEventListener("mouseout",function(){ _self.showInfoText(_self.defaultInfoText); });
        button.addEventListener("click",function(){
            world.player.setImage(imageLib.images[racenum][_self.selectedShip]); 
            world.player.setTeam(racenum);
            net.sendArray(CP_OUTFIT.data(racenum, _self.selectedShip));
        });
        return button;
    },

    /* Add a ship button to the canvas and return its cake.js object. */
    makeShipButton: function(txt, shipId, x, y, fg, bg, desc) {
        var _self = this;
        var button = new Rectangle(this.shipButtonDim, this.shipButtonDim, {x:x, y:y, rx:10, ry:10, strokeWidth:2, stroke: fg, fill:bg});
        button.append(new TextNode(txt, {y:15, x:this.shipButtonDim/2, fill: fg, font: "bold 8pt Courier", textAlign:"center"}));
        button.addEventListener("mouseover",function(){ _self.showInfoText(desc); });
        button.addEventListener("mouseout",function() { _self.showInfoText(_self.defaultInfoText); });
        button.addEventListener("click",function() { _self.selectShip(shipId); });
        return button;
    },
   
    init: function(canvas) {
        this.oCanvas = canvas;

        // add race buttons
        var bufferPx = 10;
        var rightAlignPx = this.canvasWidth - this.raceButtonDim - bufferPx;
        var bottomAlignPx = this.canvasHeight - this.raceButtonDim - bufferPx;
        this.raceButtons.push(this.makeRaceButton("ROM", "Romulans", ROM,
                              bufferPx, bufferPx, imageLib.getRaceColor(ROM),
                              imageLib.getRaceColor(ROM, true)));
        this.raceButtons.push(this.makeRaceButton("KLI", "Klingons", KLI,
                              rightAlignPx, bufferPx, imageLib.getRaceColor(KLI),
                              imageLib.getRaceColor(KLI, true)));
        this.raceButtons.push(this.makeRaceButton("FED", "Federation", FED,
                              bufferPx, bottomAlignPx, imageLib.getRaceColor(FED),
                              imageLib.getRaceColor(FED, true)));
        this.raceButtons.push(this.makeRaceButton("ORI", "Orions", ORI,
                              rightAlignPx, bottomAlignPx, imageLib.getRaceColor(ORI),
                              imageLib.getRaceColor(ORI, true)));
 
        // add ship buttons
        var centerPx = (this.canvasWidth - this.shipButtonDim) / 2 - 5;
        var topRowPx = 60;
        var bottomRowPx = this.shipButtonDim + topRowPx + 5;
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
        this.otherElems.push(new Line(justRightPx-5,topRowPx+10,justRightPx-5,
                                      bottomRowPx+this.shipButtonDim-10,
                                      {stroke:"#0CC", strokeWidth:2}));
       
        this.infoBox = new Rectangle(420, 120, {x:centerPx-210+this.shipButtonDim/2,
                                                y:bottomRowPx+this.shipButtonDim+20,
                                                rx:10, ry:10, strokeWidth:2,
                                                stroke: "#5FF", fill:"#033"});
        
        //this.otherElems.push(new TextNode("http://www.netrek.com", {textAlign:"center", x:this.canvasWidth/2, y:this.canvasHeight-8, fill:"#FFF", font:"16px Courier"}));       

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
    },

    undraw: function() {
        this.oCanvas.removeAllChildren();
    },

    /* respond to SP_MASK packets */
    applyMask: function(mask) {
       
    },
   
    showInfoText: function(strArray) {
        this.infoBox.removeAllChildren();
        for(var i=0; i<strArray.length; ++i) {
            this.infoBox.append(new TextNode(strArray[i], {y:17*(i+1)+5, x:10, font:"12pt Courier", fill: this.infoBox.stroke}));
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
    }
}

