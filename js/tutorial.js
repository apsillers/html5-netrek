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


    Singleton that handles the intro tutorial.

    Various parts of the code (especially packets.js) call

        tutorial.handleKeyword("someKeyword")

    where "someKeyword" is the keyword indicating what the player just did (join, speed2, torp, etc.) so that the tutorial can respond to user action
*/
tutorial = {
    active: false,
    currentStep: null,
    nextKeyword: null,
    tutorialDiv: null,
    tutorialTab: null,
    tutorialBody: null,

    steps: [
        {
            prompt: "Welcome to Netrek! To get started, choose a team by <b>clicking one of the four buttons</b> in the corners of the left display.<br/><br/>To see the full display, you can hide this tutorial sidebar by clicking the &quot;<b>&gt;&gt;</b>&quot; tab.",
            keyword: "join"
        },
        {
            prompt: "Congratulations, captain! You are now in command of a starship, shown in the center of the left-side screen.<br/><br/>To set course, <b>right click</b> anywhere on the left-side screen near your ship.",
            keyword: "direct"
        },
        {
            prompt: "Now let's try moving: <b>press the 5 key</b> on your keyboard. This will set your target speed to warp 5.",
            keyword: "speed5"
        },
        {
            prompt: "You can see your current speed on the speed meter to the far left. The smaller bar next to it is your <b>engine temperature</b> meter, which rises when you travel at high speeds. Maxing out that bar will cripple your ship temporarily.<br/><br/>Try lowering your speed to warp 2, by pressing the <b>2 key</b> on your keyboard. Note that lower speeds will increase your turn rate, and higher speed decrease it.",
            keyword: "speed2"
        },
        {
            prompt: "Now cut your engines and coast to a stop by pressing the <b>0 key</b>.",
            keyword: "speed0"
        },
        {
            prompt: "The top right panel (currently obscured by this tutorial panel) is your <b>galactic map</b>, showing the locations of all the planets and ships in the galaxy. Planets are shown as yellow circles, and each ship is represented by its player number and colored by team. The galaxy is divided up into four quadrents, one for each team. Go ahead now and <b>hide this tutorial panel</b> (by clicking the '>>' tab) to see the map, then click it again to bring it back.<br/><br/>Once you've done that,  we'll go over the weapon systems on your ship: <i>torpedoes</i> and <i>phasers</i>. <b>Left click</b> to fire a torpedo.",
            keyword:"torp"
        },
        {
            prompt: "Torpedoes explode when they hit an enemy ship, and they do a fixed amount of damage to all nearby vessels. You can only have <b>eight torpedoes</b> active at one time. Each torpedo costs a small amount of fuel to launch.<br/><br/>If you know your torpedos are going to miss your target, you can order them to self-destruct. That way, you might still catch an catch an enemy in the explosion. (Plus, once your torps are gone, you can fire eight more.) Try firing some torpedoes and pressing <b>Shift+D</b> to detonate your torps.",
            keyword:"detmytorp"
        },
        {
            prompt: "You can also press <b>d</b> (without the shift key) to detonate enemy torpedoes near you. You still take a fraction of the damage from the blast, but it's better than suffering a direct hit.<br/><br/>That's all for torpedoes. Next, try firing your phasers: <b>middle click</b> (if you have a three-button mouse) or <b>shift + left click</b> to fire.",
            keyword:"phaser"
        },
        {
            prompt: "Phasers only damage a single target (unlike torpedoes, which explode), and they deal variable damage based on <b>how close you are to the target</b>. Long-range phaser fire isn't very effective, but up-close shots can be quite powerful. Phasers are limited by a recharge timer, so you can only fire them once every few seconds.<br /></br>Phasers use more fuel than torpedoes. If you fire your phasers a few more times, you'll find that your <b>fuel meter</b> (bottom-left orange meter) is partially depleted. Your ship slowly generates fuel normally, but if you need to refuel faster, you can put your ship into <b>repair mode</b>. Do so now by pressing <b>Shift+R</b>.",
            keyword:"repair"
        },
        {
            prompt:"Going into repair mode refuels your ship more quickly, and it repairs damage to your hull and shields, indicated by the green and blue meters in the bottom-left corner. Going into repair mode also turns off your shields, making to vulnerable to direct hull damage. Press the <b>s</b> key to bring your shields back online.",
            keyword: "shields"
        },
        {
            prompt:"One last important ship capability: cloaking. When you cloak your ship, it turns invisible in the main screen, and is represented by a gray question mark on the galactic map. Press <b>c</b> to turn on your ship's cloaking device.",
            keyword: "cloakon"
        },
        {
            prompt:"You cannot fire while cloaked, and you slowly burn fuel to maintain the cloak.<br/><br/>While you're cloaked, it not possible for your teammates to tell if your ship is a friend or a foe, so make sure you don't cloak near your own planets; generally, cloak only while on the offensive. Otherwise, your teammates might assume you are an enemy and waste time chasing after you.<br /><br/>Deactivate the cloak by pressing <b>c</b> again.",
            keyword: "cloakoff"
        },
        {
            prompt:"Great! You've now learned all the basic functionality of your ship.<br/><br/>Next, we'll talk about planets. Try flying to a <b>nearby firendly planet</b> (one in your home quadrent), and <b>slow down or stop</b> on top of the planet. (Use the <b>0</b>, <b>1</b>, or <b>2</b> key to bring your speed to warp 2 or below.)",
            keyword: "approach"
        },
        {
            prompt: "Great, now <b>press the o key</b> to <b>orbit the planet</b>.",
            keyword: "orbit"
        },
        {
            prompt: "Once you orbitting a planet, you have a lot of options:<ul><li>When orbiting a planet with a wrench, repair mode will be much more effective.</li><li>Orbiting a planet with an orange fuel can will refil your fuel very quickly.</li></ul>[This tutorial is a work in progress. <b>This is currently the last entry.</b> Please see the <a href='http://www.netrek.org/beginner/newbie.php'>newbie guide</a> to learn much more about how to download and play Netrek.]",
            keyword: ""
        },
        {
            prompt: "",
            keyword: ""
        }
    ],

    showStep: function(num) {
        if(num==1) {
            net.sendArray(CP_MESSAGE.data(MALL, 0, "!! This player is using the tutorial from http://netrek.nodester.com"));
            net.sendArray(CP_MESSAGE.data(MALL, 0, "!! Please be patient as this player learns to play Netrek"));
        }

        var newHTML = "<div style='color: black; padding: 5px; background-color: white; border: thin solid red; min-height: 100px;'>";
        newHTML += this.steps[num].prompt;
        newHTML += "</div>"

        if(num > 0) { 
            newHTML += "<div style='color: black; background-color: gray; padding: 0 5px 5px 5px;'>";
            for(var i=num-1; i>=0; --i) {
                newHTML += "<hr/>" + this.steps[i].prompt;
            }
            newHTML += "</div>";
        }

        this.tutorialBody.innerHTML = newHTML;
    },

    activateTutorial: function() {
        this.active = true;
        this.tutorialBody.innerHTML = "";
        this.currentStep = this.currentStep || 0;

        // if the user already joined a team, skip to the piloting step
        if(this.currentStep == 0 && world.drawn == true) { this.currentStep = 1; }
        this.showStep(this.currentStep);
    },

    handleKeyword: function(keyword) {
        if(keyword == this.steps[this.currentStep].keyword) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.showTutorialPanel.call(this.tutorialTab);
        }
    },

    showTutorialPanel: function() {
        if(this != tutorial.tutorialTab) { return tutorial.showTutorialPanel.call(tutorial.tutorialTab); }
        tutorial.tutorialBody.style.display = "block";
        tutorial.tutorialBody.style.padding = "10px";
        this[(this.innerText==undefined)?"textContent":"innerText"] = ">>";
        this.removeEventListener("click",tutorial.showTutorialPanel);
        this.addEventListener("click", tutorial.hideTutorialPanel);
    },

    hideTutorialPanel: function() {
        if(this != tutorial.tutorialTab) { return tutorial.hideTutorialPanel.call(tutorial.tutorialTab); }
        tutorial.tutorialBody.style.display = "none";
        tutorial.tutorialBody.style.padding = "0";
        this[(this.innerText==undefined)?"textContent":"innerText"] = "<< ?";
        this.removeEventListener("click", tutorial.hideTutorialPanel);
        tutorial.tutorialTab.addEventListener("click", tutorial.showTutorialPanel);
    },

    init: function(div, tab, body) {
        var _self = this;
        this.tutorialDiv = div;
        this.tutorialTab = tab;
        this.tutorialBody = body;

        this.tutorialTab.addEventListener("click", this.showTutorialPanel);

        
    }
}
