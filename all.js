var imageLib={ships:"SC,DD,CA,BB,AS,SB".split(","),races:["Rom","Kli","Ori","Fed"],raceIds:[ROM,KLI,ORI,FED],images:[],loadAll:function(){for(var a=0;a<this.races.length;++a){this.images[this.raceIds[a]]=[];for(var b=0;b<this.ships.length;++b){var c=new Image;this.images[this.raceIds[a]][b]=c;c.src="/data/img/"+this.races[a]+"/"+this.ships[b]+"0.png"}}}};function BufferPack(){var a,b=!1,c=this;c._DeArray=function(a,b,c){return[a.slice(b,b+c)]};c._EnArray=function(a,b,c,e){for(var f=0;f<c;a[b+f]=e[f]?e[f]:0,f++);};c._DeChar=function(a,b){return String.fromCharCode(a[b])};c._EnChar=function(a,b,c){a[b]=c.charCodeAt(0)};c._DeInt=function(c,j){var d=b?a.len-1:0,e=b?-1:1,f=d+e*a.len,h,k;h=0;for(k=1;d!=f;h+=c[j+d]*k,d+=e,k*=256);a.bSigned&&h&Math.pow(2,8*a.len-1)&&(h-=Math.pow(2,8*a.len));return h};c._EnInt=function(c,j,d){for(var e=b?a.len-1:0,f=b?-1:
1,h=e+f*a.len,d=d<a.min?a.min:d>a.max?a.max:d;e!=h;c[j+e]=d&255,e+=f,d>>=8);};c._DeString=function(a,b,c){for(var e=Array(c),f=0;f<c;e[f]=String.fromCharCode(a[b+f]),f++);return e.join("")};c._EnString=function(a,b,c,e){for(var f,h=0;h<c;a[b+h]=(f=e.charCodeAt(h))?f:0,h++);};c._DeNullString=function(a,b,d,e){a=c._DeString(a,b,d,e);return a.substring(0,a.length-1)};c._De754=function(c,j){var d,e,f,h,k,l,m,n,o;m=a.mLen;f=8*a.len-a.mLen-1;o=(1<<f)-1;n=o>>1;h=b?0:a.len-1;k=b?1:-1;d=c[j+h];h+=k;l=-7;e=
d&(1<<-l)-1;d>>=-l;for(l+=f;0<l;e=256*e+c[j+h],h+=k,l-=8);f=e&(1<<-l)-1;e>>=-l;for(l+=m;0<l;f=256*f+c[j+h],h+=k,l-=8);switch(e){case 0:e=1-n;break;case o:return f?NaN:Infinity*(d?-1:1);default:f+=Math.pow(2,m),e-=n}return(d?-1:1)*f*Math.pow(2,e-m)};c._En754=function(c,j,d){var e,f,h,k,l,m,n;m=a.mLen;n=8*a.len-a.mLen-1;k=(1<<n)-1;h=k>>1;e=0>d?1:0;d=Math.abs(d);if(isNaN(d)||Infinity==d)d=isNaN(d)?1:0,f=k;else{f=Math.floor(Math.log(d)/Math.LN2);if(1>d*(l=Math.pow(2,-f)))f--,l*=2;d=1<=f+h?d+a.rt/l:d+
a.rt*Math.pow(2,1-h);2<=d*l&&(f++,l/=2);f+h>=k?(d=0,f=k):1<=f+h?(d=(d*l-1)*Math.pow(2,m),f+=h):(d=d*Math.pow(2,h-1)*Math.pow(2,m),f=0)}h=b?a.len-1:0;for(k=b?-1:1;8<=m;c[j+h]=d&255,h+=k,d/=256,m-=8);f=f<<m|d;for(n+=m;0<n;c[j+h]=f&255,h+=k,f/=256,n-=8);c[j+h-k]|=128*e};c._sPattern="(\\d+)?([AxcbBhHsSfdiIlL])(\\(([a-zA-Z0-9]+)\\))?";c._lenLut={A:1,x:1,c:1,b:1,B:1,h:2,H:2,s:1,S:1,f:4,d:8,i:4,I:4,l:4,L:4};c._elLut={A:{en:c._EnArray,de:c._DeArray},s:{en:c._EnString,de:c._DeString},S:{en:c._EnString,de:c._DeNullString},
c:{en:c._EnChar,de:c._DeChar},b:{en:c._EnInt,de:c._DeInt,len:1,bSigned:!0,min:-Math.pow(2,7),max:Math.pow(2,7)-1},B:{en:c._EnInt,de:c._DeInt,len:1,bSigned:!1,min:0,max:Math.pow(2,8)-1},h:{en:c._EnInt,de:c._DeInt,len:2,bSigned:!0,min:-Math.pow(2,15),max:Math.pow(2,15)-1},H:{en:c._EnInt,de:c._DeInt,len:2,bSigned:!1,min:0,max:Math.pow(2,16)-1},i:{en:c._EnInt,de:c._DeInt,len:4,bSigned:!0,min:-Math.pow(2,31),max:Math.pow(2,31)-1},I:{en:c._EnInt,de:c._DeInt,len:4,bSigned:!1,min:0,max:Math.pow(2,32)-1},
l:{en:c._EnInt,de:c._DeInt,len:4,bSigned:!0,min:-Math.pow(2,31),max:Math.pow(2,31)-1},L:{en:c._EnInt,de:c._DeInt,len:4,bSigned:!1,min:0,max:Math.pow(2,32)-1},f:{en:c._En754,de:c._De754,len:4,mLen:23,rt:Math.pow(2,-24)-Math.pow(2,-77)},d:{en:c._En754,de:c._De754,len:8,mLen:52,rt:0}};c._UnpackSeries=function(b,c,d,e){for(var f=a.de,h=[],k=0;k<b;h.push(f(d,e+k*c)),k++);return h};c._PackSeries=function(b,c,d,e,f,h){for(var k=a.en,l=0;l<b;k(d,e+l*c,f[h+l]),l++);};c._zip=function(a,b){for(var c={},e=0;e<
a.length;e++)c[a[e]]=b[e];return c};c.unpack=function(c,j,d){b="<"!=c.charAt(0);for(var d=d?d:0,e=RegExp(this._sPattern,"g"),f,h,k,l=[],m=[];f=e.exec(c);){h=void 0==f[1]||""==f[1]?1:parseInt(f[1]);if("S"===f[2]){for(h=0;0!==j[d+h];)h++;h++}k=this._lenLut[f[2]];if(d+h*k>j.length)return;switch(f[2]){case "A":case "s":case "S":m.push(this._elLut[f[2]].de(j,d,h));break;case "c":case "b":case "B":case "h":case "H":case "i":case "I":case "l":case "L":case "f":case "d":a=this._elLut[f[2]],m.push(this._UnpackSeries(h,
k,j,d))}l.push(f[4]);d+=h*k}m=Array.prototype.concat.apply([],m);return-1!==l.indexOf(void 0)?m:this._zip(l,m)};c.packTo=function(c,j,d,e){b="<"!=c.charAt(0);for(var f=RegExp(this._sPattern,"g"),h,k,l,m=0;h=f.exec(c);){k=void 0==h[1]||""==h[1]?1:parseInt(h[1]);"S"===h[2]&&(k=e[m].length+1);l=this._lenLut[h[2]];if(d+k*l>j.length)return!1;switch(h[2]){case "A":case "s":case "S":if(m+1>e.length)return!1;this._elLut[h[2]].en(j,d,k,e[m]);m+=1;break;case "c":case "b":case "B":case "h":case "H":case "i":case "I":case "l":case "L":case "f":case "d":a=
this._elLut[h[2]];if(m+k>e.length)return!1;this._PackSeries(k,l,j,d,e,m);m+=k;break;case "x":for(h=0;h<k;h++)j[d+h]=0}d+=k*l}return j};c.pack=function(a,b){return this.packTo(a,Array(this.calcLength(a,b)),0,b)};c.calcLength=function(a,b){for(var c=RegExp(this._sPattern,"g"),e,f=0,h=0;e=c.exec(a);){var k=(void 0==e[1]||""==e[1]?1:parseInt(e[1]))*this._lenLut[e[2]];"S"===e[2]&&(k=b[h].length+1);f+=k;h++}return f};this.stringToBytes=function(a){for(var b=[],c=0;c<a.length;++c)b[c]=a.charCodeAt(c);return b}}
packer=new BufferPack;window.addEventListener("load",function(){rightCanvas=new Canvas(document.getElementById("rightCanvas"),500,500,{fill:"black"});leftCanvas=new Canvas(document.getElementById("leftCanvas"),500,500,{fill:"black"});outfitting.init(leftCanvas);world.init(leftCanvas,rightCanvas);hud.init(leftCanvas);imageLib.loadAll();net=new NetrekConnection(location.hostname,location.port||80,function(){net.connectToServer("continuum.us.netrek.org",2592,function(){net.sendArray(CP_LOGIN.data(0,"guest","","hello world"));
outfitting.draw()})})});NetrekConnection=function(a){this.buffer="";this.socketId=0;var b=this;this.getSeverList=function(){};this.connectToServer=function(a,g,j){chrome.socket.connect(this.socketId,a,g,function(){document.title+=" - "+_self.serverHost;_self.sendArray(CP_SOCKET.data(10));setInterval(b.readMessages,100);j()})};this.readMessages=function(){chrome.socket.read(this.socketId,null,function(a){0<a.resultCode&&(b.buffer+=String.fromCharCode(null,new Int8Array(a.data)),b.execMessages())})};this.execMessages=function(){if(0!=
this.buffer.length){var a=b.buffer.chatCodeAt(0),g=serverPackets[a];void 0===g&&(console.error("unknown message code "+a),this.buffer=this.buffer.substr(1),this.execMessages());var a=packer.calcLength(g.format),j=this.buffer.substr(0,a);j.length==a&&(this.buffer=this.buffer.substr(a),g.handler(packer.stringToBytes(j)))}};this.sendArray=function(){chrome.socket.write(this.socketId,(new Uint8Array(data_array)).buffer)};chrome.socket.create("tcp",{},function(c){b.socketId=c.socketId;a()})};
Array.prototype.next=function(){return this.splice(0,1)[0]};NetrekConnection=function(a,b,c){"function"==typeof window.Worker&&(this.worker=new Worker("js/net_worker.js"));this.host=a||"localhost";this.port=b||8080;this.serverPort=this.serverHost=null;this.conn=io.connect("ws://"+this.host+":"+this.port);this.conn.once("connect",c);this.buffer="";this.reading=!1;this.getServerList=function(a){this.conn.once("serverData",function(b){typeof a==="function"&&a(b)});this.conn.emit("serverDataReq")};this.connectToServer=function(a,b,c){b=b||2592;this.serverHost=
a;this.serverPort=b;var e=this;this.conn.once("serverConnected",function(){document.title=document.title+(" - "+e.serverHost);e.sendArray(CP_SOCKET.data(10));if(e.worker){e.worker.addEventListener("message",function(a){typeof a.data=="object"&&typeof a.data.msgCode!="undefined"&&serverPackets[a.data.msgCode].handler(a.data.data)});this.on("message",function(a){e.worker.postMessage(a)})}else this.on("message",function(a){e.buffer=e.buffer+atob(a);e.reading||e.readMessages()});this.once("serverClosure",
function(){console.warn("The Netrek server unexpected closed the connection. You probably timed out. Try reloading the page.")});c()});this.conn.emit("joinServer",{host:a,port:b})};this.sendArray=function(a){this.conn.send(btoa(String.fromCharCode.apply(this,a)))};this.readMessages=function(){if(this.buffer.length==0)this.reading=false;else{this.reading=true;var a=this.buffer.charCodeAt(0),b=serverPackets[a];if(b===void 0){console.error("unknown message code "+a);this.buffer=this.buffer.substr(1);
this.readMessages()}else{var a=packer.calcLength(b.format),c=this.buffer.substr(0,a);if(c.length==a){this.buffer=this.buffer.substr(a);b.handler(packer.stringToBytes(c));setTimeout(this.readMessages(),0)}else this.reading=false}}}};Array.prototype.next=function(){return this.splice(0,1)[0]};importScripts("jspack.js");importScripts("packets.js");importScripts("lib/base64.js");var buffer="",reading=!1,net_logging=!1;onmessage=function(a){buffer+=Base64.decode(a.data);reading||readMessages()};
readMessages=function(){if(0==buffer.length)reading=!1;else{reading=!0;var a=buffer.charCodeAt(0),b=serverPackets[a];if(void 0===b)postMessage("unknown message code "+a),this.buffer=this.buffer.substr(1),this.readMessages();else{var b=packer.calcLength(b.format),c=this.buffer.substr(0,b);c.length==b?(this.buffer=this.buffer.substr(b),postMessage({msgCode:a,data:packer.stringToBytes(c),clear:0==buffer.length}),postMessage(buffer.length),readMessages()):reading=!1}}};
serverPackets=[{code:11,format:"!bxxx80s",handler:function(a){(a=packer.unpack(this.format,a))&&(message=a[1]);net_logging&&console.log(message)}},{code:12,format:"!bbbbbbxxIlllhhhh",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),f=b.next(),h=b.next(),k=b.next(),l=b.next(),m=b.next(),n=b.next(),b=b.next();net_logging&&console.log("SP_YOU pnum=",a,"hostile=",team_decode(c),"swar=",team_decode(g),"armies=",j,"tractor=",
d,"flags=",e.toString(2),"damage=",f,"shield=",h,"fuel=",k,"etemp=",l,"wtemp=",m,"whydead=",n,"whodead=",b);null==world.playerNum&&(world.playerNum=a);hud.showFuelLevel(k/100);hud.showHullLevel(100-Math.max(f,0));hud.showShieldLevel(Math.min(h,100))}},{code:24,format:"!bbbx16s16s16s",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PL_LOGIN pnum=",a,"rank=",c,"name=",g,"monitor=",j,"login=",b)}},
{code:22,format:"!bbbb",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_HOSTILE pnum=",a,"war=",team_decode(c),"hostile=",team_decode(b))}},{code:2,format:"!bbbb",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=team_decode(b.next());net_logging&&console.log("SP_PLAYER_INFO pnum=",a,"shiptype=",c,"team=",b);var g=imageLib.images[b.length?b[0]:FED][c];void 0==world.ships[a]&&
world.addShip(a,new Ship({img:g,galImg:imageLib.images[1][c],team:b[0]||1,number:a.toString()}))}},{code:3,format:"!bbxxI",handler:function(a){var b=packer.unpack(this.format,a);b.next();a=b.next();b=b.next();net_logging&&console.log("SP_KILLS pnum=",a,"kills=",b)}},{code:20,format:"!bbbx",handler:function(a){var b=packer.unpack(this.format,a);b.next();a=b.next();b=b.next();net_logging&&console.log("SP_PSTATUS pnum=",a,"status=",b)}},{code:4,format:"!bbBbll",handler:function(a){var b=packer.unpack(this.format,
a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PLAYER pnum=",a,"dir=",c,"speed=",g,"x=",j,"y=",b);world.ships[a].setRotation(c);world.ships[a].setPosition(j,b);world.ships[a].speed=g}},{code:18,format:"!bbbxI",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_FLAGS pnum=",a,"tractor=",c,"flags=",b)}},{code:26,format:"!bbxxll16s",handler:function(a){var b=packer.unpack(this.format,
a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&console.log("SP_PLANET_LOC pnum=",a,"x=",c,"y=",g,"name=",b);void 0==world.planets[a]&&world.addPlanet(a,new world.Planet(c,g,b,[],world))}},{code:17,format:"!bbxxl96s",handler:function(a){a=packer.unpack(this.format,a);a.next();var b=a.next(),c=a.next();a.next();net_logging&&console.log("SP_LOGIN accept=",b,"flags=",c.toString(2))}},{code:19,format:"!bbxx",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();
net_logging&&console.log("SP_MASK mask=",team_decode(a))}},{code:16,format:"!bbxx",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();net_logging&&console.log("SP_PICKOK state=",a);1==a&&(outfitting.undraw(),world.ships[world.playerNum],world.draw())}},{code:25,format:"!bxxx16s",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();a=packer.unpack("16b",a);net_logging&&console.log("SP_RESERVED data=",a)}},{code:5,format:"!bbbxhxx",handler:function(a){var b=packer.unpack(this.format,
a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_TORP_INFO war=",team_decode(a)," status=",c," tnum=",b);void 0==world.torps[b]&&1==c?world.addTorp(b,new Torp(-1E4,-1E4,0,a,world)):void 0!=world.torps[b]&&(0==c||2==c||3==c)?world.removeTorp(b):console.log("SP_TORP_INFO war=",team_decode(a)," status=",c," tnum=",b)}},{code:6,format:"!bBhll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&console.log("SP_TORP dir=",
a," tnum=",c," x=",g," y=",b);void 0!=world.torps[c]&&(world.torps[c].dir=a,world.torps[c].x=g,world.torps[c].y=b)}},{code:8,format:"!bbbxhxx",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_PLASMA_INFO war=",team_decode(a),"status=",c,"pnum=",b)}},{code:9,format:"!bxhll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_PLASMA pnum=",a,
"x=",c,"y=",b)}},{code:14,format:"!bbxxIIIIIL",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),b=b.next();net_logging&&console.log("SP_STATUS tourn=",a,"armsbomb=",c,"planets=",g,"kills=",j,"losses=",d,"time=",e,"timepro=",b)}},{code:7,format:"!bbbBlll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),b=b.next();net_logging&&console.log("SP_PHASER pnum=",
a,"status=",c,"dir=",g,"x=",j,"y=",d,"target=",b)}},{code:15,format:"!bbbbhxxl",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PLANET pnum=",a,"owner=",c,"info=",g,"flags=",j.toString(2),"armies=",b)}},{code:1,format:"!bBBB80s",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&console.log("SP_MESSAGE m_flags=",a.toString(2),
"m_recpt=",c,"m_from=",g,"mesg=",b)}},{code:23,format:"!bbxx13l",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),f=b.next(),h=b.next(),k=b.next(),l=b.next(),m=b.next(),n=b.next(),o=b.next(),b=b.next();net_logging&&console.log("SP_STATS pnum=",a,"tkills=",c,"tlosses=",g,"kills=",j,"losses=",d,"tticks=",e,"tplanets=",f,"tarmies=",h,"sbkills=",k,"sblosses=",l,"armies=",m,"planets=",n,"maxkills=",o,"sbmaxkills=",b)}},
{code:10,format:"!bxxx80s",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();net_logging&&console.log("SP_WARNING message=",a)}}];for(var sp=[],i=0;i<serverPackets.length;++i)sp[serverPackets[i].code]=serverPackets[i];serverPackets=sp;function team_decode(a){var b=[];a&FED&&b.push(FED);a&ROM&&b.push(ROM);a&KLI&&b.push(KLI);a&ORI&&b.push(ORI);return b};var SC=0,DD=1,CA=2,BB=3,AS=4,SB=5;
outfitting={canvasWidth:500,canvasHeight:500,raceButtonDim:96,shipButtonDim:70,oCanvas:null,infoBox:null,raceButtons:[],shipButtons:[],otherElems:[],selectedShip:CA,mask:[],defaultInfoText:"Select a ship, then choose a race to;enter the game.;;;;New players should try a Cruiser first.".split(";"),makeRaceButton:function(a,b,c,g,j,d,e){var f=this;this._netrekDisabled=!1;var h="Your race sets your team alligience and;your home planet (for refit & respawn).;;Each ship class is identical across all;races, e.g., a Klingon Scout is just;as good as a Federation one.".split(";"),g=
new Rectangle(this.raceButtonDim,this.raceButtonDim,{x:g,y:j,rx:10,ry:10,strokeWidth:2,stroke:d,fill:e});g.append(new TextNode(a,{y:30,x:this.raceButtonDim/2,fill:d,font:"bold 20pt Courier",textAlign:"center"}));g.append(new TextNode(b,{y:this.raceButtonDim-15,x:this.raceButtonDim/2,fill:d,font:"bold 11pt Courier",textAlign:"center"}));g.addEventListener("mouseover",function(){f.showInfoText(h)});g.addEventListener("mouseout",function(){f.showInfoText(f.defaultInfoText)});g.addEventListener("click",
function(){this._netrekDisabled||(world.player.setImage(imageLib.images[c][f.selectedShip]),world.player.setTeam(c),net.sendArray(CP_UPDATES.data(1E5)),net.sendArray(CP_OUTFIT.data(teamLib.teamNumber(c),f.selectedShip)))});return g},makeShipButton:function(a,b,c,g,j,d,e){var f=this,c=new Rectangle(this.shipButtonDim,this.shipButtonDim,{x:c,y:g,rx:10,ry:10,strokeWidth:2,stroke:j,fill:d});c.append(new TextNode(a,{y:15,x:this.shipButtonDim/2,fill:j,font:"bold 8pt Courier",textAlign:"center"}));c.addEventListener("mouseover",
function(){f.showInfoText(e)});c.addEventListener("mouseout",function(){f.showInfoText(f.defaultInfoText)});c.addEventListener("click",function(){f.selectShip(b)});return c},init:function(a){this.oCanvas=a;var a=this.canvasWidth-this.raceButtonDim-10,b=this.canvasHeight-this.raceButtonDim-10;this.raceButtons.push(this.makeRaceButton("FED","Federation",teamLib.FED,10,b,teamLib.getRaceColor(FED),teamLib.getRaceColor(FED,!0)));this.raceButtons.push(this.makeRaceButton("ROM","Romulans",teamLib.ROM,10,
10,teamLib.getRaceColor(ROM),teamLib.getRaceColor(ROM,!0)));this.raceButtons.push(this.makeRaceButton("KLI","Klingons",teamLib.KLI,a,10,teamLib.getRaceColor(KLI),teamLib.getRaceColor(KLI,!0)));this.raceButtons.push(this.makeRaceButton("ORI","Orions",teamLib.ORI,a,b,teamLib.getRaceColor(ORI),teamLib.getRaceColor(ORI,!0)));var a=(this.canvasWidth-this.shipButtonDim)/2-5,b=this.shipButtonDim+60+5,c=a-this.shipButtonDim-5,g=a+this.shipButtonDim+10;this.shipButtons[SC]=this.makeShipButton("Scout",SC,c,
60,"#0FF","#033","Fast and light, the Scout excels at;dodging enemy fire and rushing behind;enemy lines to bomb planets.;;It has weak phasers, but fast torpedos,;making it fit for long-range fighting.".split(";"));this.shipButtons[DD]=this.makeShipButton("Destroyer",DD,a,60,"#0FF","#033",["The Destroyer is a challenging ship to","command effectively, but is noted for","its superior cloaking abilites.","","Useful for suicide runs on Starbases."]);this.shipButtons[CA]=this.makeShipButton("Cruiser",
CA,c,b,"#0FF","#033",["A well-balanced ship, favored widely","by captains of all skill levels.","","Highly recommended for new players."]);this.shipButtons[BB]=this.makeShipButton("Battleship",BB,a,b,"#0FF","#033",["Slow and powerful, Battleships can take","a beating, but their powerful weapons","use up fuel quickly.","","Excellent for planet defense."]);this.shipButtons[AS]=this.makeShipButton("Assult",AS,g,60,"#0FF","#033","With proper support, the Assult Ship can;capture planets quite swiftly. It holds;more armies than any other ship and it;is an unmatched planet bomber.;;It also withstands damage very well.".split(";"));
this.shipButtons[SB]=this.makeShipButton("Starbase",SB,g,b,"#0FF","#033",["Available only to the most experienced","players, a Starbase can usually be","destroyed only by a coordinated effort","(called 'ogging')."]);this.shipButtons[SB].opacity=0.3;this.otherElems.push(new Line(g-5,70,g-5,b+this.shipButtonDim-10,{stroke:"#0CC",strokeWidth:2}));this.infoBox=new Rectangle(420,120,{x:a-210+this.shipButtonDim/2,y:b+this.shipButtonDim+20,rx:10,ry:10,strokeWidth:2,stroke:"#5FF",fill:"#033"});this.selectShip(CA)},
draw:function(){for(var a=0;a<this.raceButtons.length;++a)this.oCanvas.append(this.raceButtons[a]);for(a=0;a<this.shipButtons.length;++a)this.oCanvas.append(this.shipButtons[a]);for(a=0;a<this.otherElems.length;++a)this.oCanvas.append(this.otherElems[a]);this.showInfoText(this.defaultInfoText);this.oCanvas.append(this.infoBox)},undraw:function(){this.oCanvas.removeAllChildren()},applyMask:function(a){this.mask=a;for(var b=0;b<this.raceButtons.length;++b)this.raceButtons[b].opacity=0.15,this.raceButtons[b]._netrekDisabled=
!0;for(b=0;b<a.length;++b)this.raceButtons[teamLib.teamNumber(a[b])].opacity=1,this.raceButtons[teamLib.teamNumber(a[b])]._netrekDisabled=!1},showInfoText:function(a){this.infoBox.removeAllChildren();for(var b=0;b<a.length;++b)this.infoBox.append(new TextNode(a[b],{y:17*(b+1)+5,x:10,font:"12pt Courier",fill:this.infoBox.stroke}))},selectShip:function(a){if(a!=SB){var b=this.shipButtons[this.selectedShip];b&&(b.stroke="#0FF",b.strokeWidth=2,b.fill="#033");this.selectedShip=a;a=this.shipButtons[this.selectedShip];
a.stroke="#F0F";a.strokeWidth=4;a.fill="#404"}}};net_logging=0;CP_SOCKET={code:27,format:"!bbbxI",data:function(a){net_logging&&console.log("CP_SOCKET");return packer.pack(this.format,[this.code,4,a,0])}};CP_LOGIN={code:8,format:"!bbxx16s16s16s",data:function(a,b,c,g){net_logging&&console.log("CP_LOGIN query=",a,"name=",b);return packer.pack(this.format,[this.code,a,b,c,g])}};CP_UPDATES={code:31,format:"!bxxxI",data:function(a){net_logging&&console.log("CP_UPDATES usecs=",a);return packer.pack(this.format,[this.code,a])}};
CP_OUTFIT={code:9,format:"!bbbx",data:function(a,b){net_logging&&console.log("CP_OUTFIT team=",teamLib.raceDecode(a),"ship=",b);return packer.pack(this.format,[this.code,a,b])}};CP_SPEED={code:2,format:"!bbxx",data:function(a){net_logging&&console.log("CP_SPEED speed=",a);return packer.pack(this.format,[this.code,a])}};CP_DIRECTION={code:3,format:"!bBxx",data:function(a){net_logging&&console.log("CP_DIRECTION direction=",a);return packer.pack(this.format,[this.code,a&255])}};
CP_MESSAGE={code:1,format:"!bBBx80s",data:function(a,b,c){net_logging&&console.log("CP_MESSAGE group=",a,"indiv=",b,"mesg=",c);return struct.pack(this.format,[this.code,a,b,c])}};CP_PHASER={code:4,format:"!bBxx",data:function(a){net_logging&&console.log("CP_PHASER direction=",a);return packer.pack(this.format,[this.code,a&255])}};CP_PLASMA={code:5,format:"!bBxx",data:function(a){net_logging&&console.log("CP_PLASMA direction=",a);return packer.pack(this.format,[this.code,a&255])}};
CP_TORP={code:6,format:"!bBxx",data:function(a){net_logging&&console.log("CP_TORP direction=",a);return packer.pack(this.format,[this.code,a&255])}};
serverPackets=[{code:11,format:"!bxxx80s",handler:function(a){(a=packer.unpack(this.format,a))&&(message=a[1]);net_logging&&console.log(message)}},{code:12,format:"!bbbbbbxxIlllhhhh",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),f=b.next(),h=b.next(),k=b.next(),l=b.next(),m=b.next(),n=b.next(),b=b.next();(net_logging||n)&&console.log("SP_YOU pnum=",a,"hostile=",team_decode(c),"swar=",team_decode(g),"armies=",j,
"tractor=",d,"flags=",e.toString(2),"damage=",f,"shield=",h,"fuel=",k,"etemp=",l,"wtemp=",m,"whydead=",n,"whodead=",b);null==world.playerNum&&(world.playerNum=a);hud.showFuelLevel(k/100);hud.showHullLevel(100-Math.max(f,0));hud.showShieldLevel(Math.min(h,100))}},{code:24,format:"!bbbx16s16s16s",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PL_LOGIN pnum=",a,"rank=",c,"name=",g,"monitor=",j,"login=",
b)}},{code:22,format:"!bbbb",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_HOSTILE pnum=",a,"war=",team_decode(c),"hostile=",team_decode(b))}},{code:2,format:"!bbbb",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=team_decode(b.next());net_logging&&console.log("SP_PLAYER_INFO pnum=",a,"shiptype=",c,"team=",b);var g=imageLib.images[b.length?b[0]:FED][c];void 0==world.ships[a]&&
world.addShip(a,new Ship({img:g,galImg:imageLib.images[1][c],team:b[0]||1,number:a.toString()}))}},{code:3,format:"!bbxxI",handler:function(a){var b=packer.unpack(this.format,a);b.next();a=b.next();b=b.next();net_logging&&console.log("SP_KILLS pnum=",a,"kills=",b)}},{code:20,format:"!bbbx",handler:function(a){var b=packer.unpack(this.format,a);b.next();a=b.next();b=b.next();console.log("SP_PSTATUS pnum=",a,"status=",b);1==b&&(world.undraw(),outfitting.draw(leftCanvas))}},{code:4,format:"!bbBbll",
handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PLAYER pnum=",a,"dir=",c,"speed=",g,"x=",j,"y=",b);world.ships[a].setRotation(c);world.ships[a].setPosition(j,b);world.ships[a].speed=g}},{code:18,format:"!bbbxI",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_FLAGS pnum=",a,"tractor=",c,"flags=",b)}},{code:26,format:"!bbxxll16s",
handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&console.log("SP_PLANET_LOC pnum=",a,"x=",c,"y=",g,"name=",b);void 0==world.planets[a]&&world.addPlanet(a,new world.Planet(c,g,b,[],world))}},{code:17,format:"!bbxxl96s",handler:function(a){a=packer.unpack(this.format,a);a.next();var b=a.next(),c=a.next();a.next();net_logging&&console.log("SP_LOGIN accept=",b,"flags=",c.toString(2))}},{code:19,format:"!bbxx",handler:function(a){a=
packer.unpack(this.format,a);a.next();a=a.next();net_logging&&console.log("SP_MASK mask=",team_decode(a));outfitting.applyMask(team_decode(a))}},{code:16,format:"!bbxx",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();console.log("SP_PICKOK state=",a);1==a&&(outfitting.undraw(),world.ships[world.playerNum],world.draw())}},{code:25,format:"!bxxx16s",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();a=packer.unpack("16b",a);net_logging&&console.log("SP_RESERVED data=",
a)}},{code:5,format:"!bbbxhxx",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_TORP_INFO war=",team_decode(a)," status=",c," tnum=",b);void 0==world.torps[b]&&1==c?world.addTorp(b,new Torp(-1E4,-1E4,0,a)):void 0!=world.torps[b]&&(0==c||2==c||3==c)&&world.removeTorp(b)}},{code:6,format:"!bBhll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&
console.log("SP_TORP dir=",a," tnum=",c," x=",g," y=",b);void 0!=world.torps[c]&&(world.torps[c].dir=a,world.torps[c].x=g,world.torps[c].y=b)}},{code:8,format:"!bbbxhxx",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_PLASMA_INFO war=",team_decode(a),"status=",c,"pnum=",b)}},{code:9,format:"!bxhll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),b=b.next();net_logging&&console.log("SP_PLASMA pnum=",
a,"x=",c,"y=",b)}},{code:14,format:"!bbxxIIIIIL",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),b=b.next();net_logging&&console.log("SP_STATUS tourn=",a,"armsbomb=",c,"planets=",g,"kills=",j,"losses=",d,"time=",e,"timepro=",b)}},{code:7,format:"!bbbBlll",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),b=b.next();net_logging&&console.log("SP_PHASER pnum=",
a,"status=",c,"dir=",g,"x=",j,"y=",d,"target=",b)}},{code:15,format:"!bbbbhxxl",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),b=b.next();net_logging&&console.log("SP_PLANET pnum=",a,"owner=",c,"info=",g,"flags=",j.toString(2),"armies=",b)}},{code:1,format:"!bBBB80s",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),b=b.next();net_logging&&console.log("SP_MESSAGE m_flags=",a.toString(2),
"m_recpt=",c,"m_from=",g,"mesg=",b);$("inbox").append("<b>"+g+":</b> "+b+"<br />");$("#inbox").scrollTop($("#inbox").height())}},{code:23,format:"!bbxx13l",handler:function(a){var b=packer.unpack(this.format,a);b.next();var a=b.next(),c=b.next(),g=b.next(),j=b.next(),d=b.next(),e=b.next(),f=b.next(),h=b.next(),k=b.next(),l=b.next(),m=b.next(),n=b.next(),o=b.next(),b=b.next();net_logging&&console.log("SP_STATS pnum=",a,"tkills=",c,"tlosses=",g,"kills=",j,"losses=",d,"tticks=",e,"tplanets=",f,"tarmies=",
h,"sbkills=",k,"sblosses=",l,"armies=",m,"planets=",n,"maxkills=",o,"sbmaxkills=",b)}},{code:10,format:"!bxxx80s",handler:function(a){a=packer.unpack(this.format,a);a.next();a=a.next();console.log("SP_WARNING message=",a)}}];sp=[];for(i=0;i<serverPackets.length;++i)sp[serverPackets[i].code]=serverPackets[i];serverPackets=sp;function team_decode(a){var b=[];a&FED&&b.push(FED);a&ROM&&b.push(ROM);a&KLI&&b.push(KLI);a&ORI&&b.push(ORI);return b};var Ship=function(a){void 0==a&&(a={});this.x=a.x||0;this.y=a.y||0;this.number=a.number;this.team=a.team;this.radius=a.radius||12;this.heading=a.heading||0;this.omega=a.omega||0;this.speed=a.speed||0;this.targetHeading=a.targetHeading||null;this.targetSpeed=a.targetSpeed||0;this.isOnCanvas=!0;if("object"!=typeof a.gfx){var b=world.netrek2world(a.x,a.y);this.gfx=new Circle(this.radius,{y:b[0]+a.img.height/2,x:b[1]+a.img.width/2,stroke:teamLib.getRaceColor(a.team),strokeWidth:1,fill:"none",radius:12,
zIndex:1E7});this.gfx.append(new ImageNode(a.img,{x:0,y:0,centered:!0,stroke:"none",zIndex:-1}))}else this.gfx=a.gfx;this.gfx.append(new TextNode(this.number,{x:15,y:-3,fill:teamLib.getRaceColor(a.team),font:"bold"}));"object"!=typeof a.galGfx?(b=world.netrek2tac(a.x,a.y),this.galGfx=new Circle(this.radius,{y:b[0],x:b[1],fill:teamLib.getRaceColor(a.team),radius:4,zIndex:1E7})):this.gfx=a.gfx;this.includingWorld=a.world;this.gfxRoot=world.wGroup};
Ship.prototype={setPosition:function(a,b){this.x=a;this.y=b},setRotation:function(a){this.gfx.childNodes[0].rotation=[2*Math.PI*a/255,0,0];this.gfx.childNodes[0].needMatrixUpdate=!0;this.gfx.needMatrixUpdate=!0},setImage:function(a){this.gfx.childNodes[0].image=a;this.gfx.needMatrixUpdate=!0},setTeam:function(a){this.team=a;this.galGfx.fill=teamLib.getRaceColor(a);this.galGfx.needMatrixUpdate=!0},setVisible:function(){},setOnCanvas:function(a){a&&!this.isOnCanvas?(this.gfxRoot.append(this.gfx),this.isOnCanvas=
!0):!a&&this.isOnCanvas&&(this.gfx.removeSelf(),this.isOnCanvas=!1)}};var IND=0,FED=1,ROM=2,KLI=4,ORI=8,teamLib={IND:0,ROM:2,KLI:4,ORI:8,FED:1,getRaceColor:function(a,b){return a==FED?b?"#330":"#FF0":a==KLI?b?"#030":"#0F0":a==ROM?b?"#300":"#F00":a==ORI?b?"#003":"#00F":"#FFF"},raceDecode:function(a){return 0==a?"F":1==a?"R":2==a?"K":3==a?"O":"I"},teamDecode:function(a){var b=[];a&FED&&b.push(FED);a&ROM&&b.push(ROM);a&KLI&&b.push(KLI);a&ORI&&b.push(ORI);return b},teamNumber:function(a){return a==FED?0:a==ROM?1:a==KLI?2:a==ORI?3:-1}};var Torp=function(a,b,c,g,j){var d=world.netrek2world(a,b),d=new Circle(2,{y:d[0],x:d[1],fill:teamLib.getRaceColor(g)});this.x=a;this.y=b;this.team=g;this.dir=c;this.gfx=d;this.includingWorld=j;this.gfxRoot=world.wGroup;this.isOnCanvas=!0};Torp.prototype={setOnCanvas:function(a){a&&!this.isOnCanvas?(this.gfxRoot.append(this.gfx),this.isOnCanvas=!0):!a&&this.isOnCanvas&&(this.gfx.removeSelf(),this.isOnCanvas=!1)}};hud={inited:!1,hCanvas:null,shieldMeter:null,shieldText:null,damageMeter:null,damageText:null,fuelMeter:null,fuelText:null,uiGfx:null,init:function(a){this.hCanvas=a;this.uiGfx=new CanvasNode;this.healthCircle=new Circle(29,{x:35,y:465,fill:"#0C0",stroke:"none",rotation:Math.PI/2});this.shieldMeter=new Circle(35,{stroke:"#3AF",fill:"none",strokeWidth:8,startAngle:0,endAngle:Math.PI,rotation:0.8*Math.PI});this.damageMeter=new Circle(15,{stroke:"#A00",fill:"none",strokeWidth:30,startAngle:0,endAngle:0});
this.damageText=new TextNode("100",{fill:"white",rotation:-Math.PI/2,textAlign:"center",font:"bold 12pt courier",x:-7});this.shieldText=new TextNode("100",{fill:"white",rotation:-Math.PI/2,textAlign:"center",font:"bold 12pt courier",x:17});this.healthCircle.append(this.damageMeter);this.healthCircle.append(this.shieldMeter);this.healthCircle.append(this.damageText);this.healthCircle.append(this.shieldText);this.uiGfx.append(this.healthCircle);this.fuelBox=new Rectangle(300,20,{x:100,y:475,stroke:"#D60",
strokeWidth:2});this.fuelMeter=new Rectangle(200,20,{fill:"#F70",stroke:"none"});this.fuelBox.append(new Circle(10,{startAngle:Math.PI/2,endAngle:-Math.PI/2,y:10,x:-1,fill:"#F70"}));this.fuelBox.append(new Circle(10,{startAngle:-Math.PI/2,endAngle:Math.PI/2,y:10,x:300,fill:"#F70",stroke:"none"}));this.fuelText=new TextNode("100",{y:15,x:150,textAlign:"center",fill:"white",font:"bold 12pt courier"});this.fuelBox.append(this.fuelMeter);this.fuelBox.append(this.fuelText);this.uiGfx.append(this.fuelBox);
this.uiGfx.opacity="0.9"},draw:function(){this.hCanvas.append(this.uiGfx)},undraw:function(){this.hCanvas.removeChild(this.uiGfx)},showShieldLevel:function(a){a=Math.max(0,Math.min(100,a));this.shieldMeter.startAngle=(100-a)/100*Math.PI;this.shieldText.text=Math.floor(a).toString()},showHullLevel:function(a){a=Math.max(0,Math.min(100,a));this.damageMeter.endAngle=2*(100-a)/100*Math.PI;this.damageText.text=Math.floor(a).toString()},showFuelLevel:function(a){a=Math.max(0,Math.min(100,a));this.fuelMeter.width=
300*(a/100);this.fuelText.text=Math.floor(a).toString()+"%"}};world={wCanvas:null,gCanvas:null,wGroup:new CanvasNode,gGroup:new CanvasNode,redrawInterval:null,objects:[],ships:[],planets:[],torps:[],stepPeriod:50,stepInterval:null,stepListeners:[],viewX:0,viewY:0,galacticFactor:200,subgalacticFactor:40,playerNum:null,player:null,init:function(a,b){this.wCanvas=a;this.gCanvas=b;this.galacticFactor=1E5/b.width},draw:function(){this.wCanvas.append(this.wGroup);this.gCanvas.append(this.gGroup);var a=this;a.redrawInterval=setInterval(function(){var b=a.player.x,
c=a.player.y,g=a.wCanvas.height/2*a.subgalacticFactor+150,j=a.wCanvas.width/2*a.subgalacticFactor+150;a.centerView(a.player.x,a.player.y);for(var d=0;d<a.objects.length;++d){var e=a.objects[d],f=a.netrek2world(e.x,e.y);e.gfx.x=f[0];e.gfx.y=f[1];e.galGfx&&(f=a.netrek2tac(e.x,e.y),e.galGfx.x=f[0],e.galGfx.y=f[1],e.galGfx.needMatrixUpdate=!0);e.setOnCanvas(Math.abs(b-e.x)<j&&Math.abs(c-e.y)<g);e.gfx.needMatrixUpdate=!0}},100);hud.draw();$(this.wCanvas.canvas).bind("contextmenu",function(b){var c=$(this).offset();
net.sendArray(CP_DIRECTION.data(a.rad2byte(a.getAngleFromCenter(b.pageX-c.left,b.pageY-c.top))));b.preventDefault()});$(this.wCanvas.canvas).click(function(b){var c=$(this).offset();net.sendArray(CP_TORP.data(a.rad2byte(a.getAngleFromCenter(b.pageX-c.left,b.pageY-c.top))));b.preventDefault()});$(this.wCanvas.canvas).mousedown(function(b){if(2==b.which){var c=$(this).offset();net.sendArray(CP_PHASER.data(a.rad2byte(a.getAngleFromCenter(b.pageX-c.left,b.pageY-c.top))));b.preventDefault()}});$(document).bind("keyup",
function(a){48<=a.which&&57>=a.which&&net.sendArray(CP_SPEED.data(a.which-48))})},undraw:function(){this.wCanvas.removeChild(this.wGroup);this.gCanvas.removeChild(this.gGroup);hud.undraw();clearInterval(this.redrawInterval);$(this.wCanvas.canvas).unbind("click",this.fireTorpWithLeftClick);$(this.wCanvas.canvas).unbind("contextmenu",this.setCourseWithRightClick);$(this.wCanvas.canvas).unbind("mousedown",this.firePhasersWithMIddleClick);$(this.wCanvas.canvas).unbind("keyup",this.setSpeedWithNumbers)},
add:function(a){this.wGroup.append(a.gfx);a.galGfx&&this.gGroup.append(a.galGfx);this.objects.push(a)},remove:function(a){this.objects.splice(this.objects.indexOf(a,1));a.gfx.removeSelf();a.galGfx&&a.galGfx.removeSelf()},addPlanet:function(a,b){this.planets[a]=b;this.add(b)},addShip:function(a,b){this.ships[a]=b;this.playerNum==a&&(this.player=b);this.add(b)},addTorp:function(a,b){this.torps[a]=b;this.add(b)},removeTorp:function(a){this.remove(this.torps[a]);this.torps[a]=void 0},centerView:function(a,
b){this.viewX=a;this.viewY=b},netrek2world:function(a,b){return[(a-this.viewX)/this.subgalacticFactor+this.wCanvas.width/2,(b-this.viewY)/this.subgalacticFactor+this.wCanvas.height/2]},netrek2tac:function(a,b){return[a/this.galacticFactor,b/this.galacticFactor]},byte2rad:function(a){return 2*a/255*Math.PI},rad2byte:function(a){0>a&&(a=2*Math.PI+a);return Math.floor(255*a/(2*Math.PI))},getAngleFromCenter:function(a,b){var c=a-this.wCanvas.width/2,g=this.wCanvas.height/2-b,j=Math.atan(c/g);0>g&&(j*=
-1,j=0<c?Math.PI-j:-Math.PI-j);return j},Planet:function(a,b,c,g,j){var d=world.netrek2world(a,b),d=new Circle(18,{y:d[0],x:d[1],fill:"none",stroke:"#FF0"}),c=new TextNode(c.replace(/\x00/g,""),{y:d.radius+15,textAlign:"center",fill:"yellow",scale:1.2,font:"bold 9px courier"});d.append(c);-1!=g.indexOf(this.FUEL)&&(g=new Polygon([0,0,5,0,8,2,8,13,0,13],{x:d.radius-12,y:-7}),g.append(new Polygon([2,3,5,6])),g.append(new Polygon([2,6,5,3])),d.append(g));this.x=a;this.y=b;this.gfx=d;a=world.netrek2tac(a,
b);this.galGfx=new Circle(this.radius,{y:a[0],x:a[1],stroke:"#FF0",radius:5,zIndex:1});this.includingWorld=j;this.gfxRoot=world.wGroup;this.isOnCanvas=!0}};world.Planet.prototype={FUEL:0,REPAIR:1,setOnCanvas:function(a){a&&!this.isOnCanvas?(this.gfxRoot.append(this.gfx),this.isOnCanvas=!0):!a&&this.isOnCanvas&&(this.gfx.removeSelf(),this.isOnCanvas=!1)}};