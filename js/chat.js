chat = {
    chatting: false, // typing message
    choosing: false, // choosing recipient
    group: 0,
    indiv: 0,
    init: function(input) {
        var self = this;

        

        $(input).bind("click", function() {
            self.choosing = false;
            self.chatting = true;
            self.group = MALL;
            self.indiv = 0;
            $(input).focus();
        });

        $(document).bind("keyup", function(e) {
            if(!self.chatting && !self.choosing && world.drawn) {
                if(e.which == 77) {
                    self.choosing = true;
                }
            } else if(self.choosing) {
                if(e.which == 84) {
                    self.group = MTEAM;
                    self.indiv = world.player.team;
                    self.choosing = false;
                    self.chatting = true;
                } else if(e.which == 65 && e.shiftKey) {
                    self.group = MALL;
                    self.indiv = 0;
                    self.choosing = false;
                    self.chatting = true;
                } else if(e.which >= 48 && e.which <= 57) {
                    self.group = MINDIV;
                    self.indiv = e.which - 48;
                    self.choosing = false;
                    self.chatting = true;
                } else {
                    self.choosing = false;
                }

                if(self.chatting) { $(input).focus(); }
            }

            if(e.which == 13) {
                if(self.chatting) {
                    net.sendArray(CP_MESSAGE.data(self.group, self.indiv, input.value));
                    $(input).blur();
                }
            };

            $(input).blur(function() {
                input.value = "";
                setTimeout(function() { self.chatting = false; }, 4);
            })
        });
    }
    
}
