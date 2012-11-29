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
var IND = 0x0, FED = 0x1, ROM = 0x2, KLI = 0x4, ORI = 0x8;
var teamLib = {
    IND:0x0,
    ROM:0x2,
    KLI:0x4,
    ORI:0x8,
    FED:0x1,

    getRaceColor: function(race, isLight) {
        if(race == FED) return isLight?"#330":"#FF0";
        if(race == KLI) return isLight?"#030":"#0F0";
        if(race == ROM) return isLight?"#300":"#F00";
        if(race == ORI) return isLight?"#003":"#00F";
        return isLight?"#FFF":"#FFF";
    },

    raceDecode: function(n) {
        if(n==0) return 'F';
        if(n==1) return 'R';
        if(n==2) return 'K';
        if(n==3) return 'O';
        return 'I';
    },

    teamDecode: function(mask) {
        var x = []
        if (mask & FED) x.push(FED);
        if (mask & ROM) x.push(ROM);
        if (mask & KLI) x.push(KLI);
        if (mask & ORI) x.push(ORI);
        return x;
    },

    teamNumber: function(team) {
        if(team==FED) return 0;
        if(team==ROM) return 1;
        if(team==KLI) return 2;
        if(team==ORI) return 3;
        return -1;
    }
}
