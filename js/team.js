var IND = 0x0, FED = 0x1, ROM = 0x2, KLI = 0x4, ORI = 0x8;
var teamLib = {
    IND:0x0,
    ROM:0x1,
    KLI:0x2,
    ORI:0x4,
    FED:0x8,

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
