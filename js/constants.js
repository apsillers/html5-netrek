/*
    File borrowed from Gytha client
      Copyright (C) 2007-2011 James Cameron (quozl@us.netrek.org)

    Minor syntactical changes are probably too trivial to be eligible for
    copyright, but in case they are not, then:
      minor syntax changes Copyright (C) 2012 Andrew P. Sillers (apsillers@gmail.com)

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
// artwork specifications

// galaxy is 100000 x 100000 pixels
// tactical dimensions are one fifth of galactic dimensions

// tactical is 20000 x 20000 galactic pixels,
// shown by regular client on 500 x 500,
// therefore a ratio of 40

// ships are 20 x 20 on regular client,
// therefore ships are 800 x 800 galactic pixels

// regular client galactic of 500 x 500 means a ratio of 200,
// therefore a ship size of 4 x 4 pixels (text shown instead)

// torpedo explosion range is 350 galactic pixels,
// therefore 8.75 regular client pixels,
// which is just inside the drawn shield radius

// upscaling to 1000 x 1000 tactical means a new ratio of 80,
// therefore a ship size of 40 x 40 pixels

// upscaling to 1000 x 1000 galactic means a new ratio of 100,
// therefore a ship size of 8 x 8 pixels

// planet orbital radius is 800 galactic pixels (ORBDIST)
// planet attack radius is 1500 galactic pixels (PFIREDIST)
// on regular client, tactical planets are 28 pixels diameter
// on regular client, galactic planets are 14 pixels diameter
// planets are 30 x 30 on regular client tactical
// planets are 60 x 60 on this tactical

GWIDTH=100000
TWIDTH=20000

EXPDIST=350 // At this range a torp will explode, set by server
SHIPDAMDIST=3000 // At this range, an exploding ship does damage, set by server

IND=0x0
FED=0x1
ROM=0x2
KLI=0x4
ORI=0x8
ALL_TEAMS = FED | ROM | KLI | ORI

teams = {IND: 'ind', FED: 'fed', ROM: 'rom', KLI: 'kli', ORI: 'ori',
         ALL_TEAMS: 'login'}

teams_long = { IND: 'independent',
               FED: 'federation',
               ROM: 'romulan',
               KLI: 'klingon',
               ORI: 'orion'
             }

teams_numeric = {IND: -1, FED: 0, ROM: 1, KLI: 2, ORI: 3}

teams_playable = [ FED, ROM, KLI, ORI ]

teams_diagonal = [ [FED, KLI], [ROM, ORI] ]

PFREE=0
POUTFIT=1
PALIVE=2
PEXPLODE=3
PDEAD=4
POBSERV=5

TFREE=0
TMOVE=1
TEXPLODE=2
TDET=3
TOFF=4
TSTRAIGHT=5

MAXTORP = 8

PFSHIELD           = 0x0001 // displayed on tactical
PFREPAIR           = 0x0002 // displayed in ReportSprite
PFBOMB             = 0x0004 // displayed in ReportSprite
PFORBIT            = 0x0008 // displayed in ReportSprite
PFCLOAK            = 0x0010 // displayed in ReportSprite
PFWEP              = 0x0020 // displayed in ReportSprite
PFENG              = 0x0040 // displayed in ReportSprite
PFROBOT            = 0x0080 // displayed in ReportSprite
PFBEAMUP           = 0x0100 // displayed in ReportSprite
PFBEAMDOWN         = 0x0200 // displayed in ReportSprite
PFSELFDEST         = 0x0400 // displayed in ReportSprite
PFGREEN            = 0x0800 // displayed as background colour
PFYELLOW           = 0x1000 // displayed as background colour
PFRED              = 0x2000 // displayed as background colour
PFPLOCK            = 0x4000 // displayed in ReportSprite
PFPLLOCK           = 0x8000 // displayed in ReportSprite
PFCOPILOT         = 0x10000 // not to be displayed
PFWAR             = 0x20000 // displayed in ReportSprite
PFPRACTR          = 0x40000 // displayed in ReportSprite
PFDOCK            = 0x80000 // displayed in ReportSprite
PFREFIT          = 0x100000 // not to be displayed
PFREFITTING      = 0x200000 // displayed in ReportSprite
PFTRACT          = 0x400000 // displayed in ReportSprite
PFPRESS          = 0x800000 // displayed in ReportSprite
PFDOCKOK        = 0x1000000 // displayed in ReportSprite
PFSEEN          = 0x2000000 // displayed in ReportSprite
PFOBSERV        = 0x8000000 // not to be displayed
PFTWARP        = 0x40000000 // displayed in ReportSprite
PFBPROBOT      = 0x80000000 // displayed in ReportSprite

NUM_TYPES=8
SCOUT=0
DESTROYER=1
CRUISER=2
BATTLESHIP=3
ASSAULT=4
STARBASE=5
SGALAXY=6
ATT=7

ships = { SCOUT:      'sc',
          DESTROYER:  'dd',
          CRUISER:    'ca',
          BATTLESHIP: 'bb',
          ASSAULT:    'as',
          STARBASE:   'sb',
          SGALAXY:    'ga',
          ATT:        'at'
        }

ships_long = { SCOUT:      'scout',
               DESTROYER:  'destroyer',
               CRUISER:    'cruiser',
               BATTLESHIP: 'battleship',
               ASSAULT:    'assault',
               STARBASE:   'starbase',
               SGALAXY:    'galaxy',
               ATT:        'ATT'
             }

ships_use = { SCOUT:      'very fast, very weak',
              DESTROYER:  'fast but weak',
              CRUISER:    'general purpose',
              BATTLESHIP: 'slow but strong',
              ASSAULT:    'bombs planets well',
              STARBASE:   'point defense',
              SGALAXY:    'for stuffing around',
              ATT:        'for cheating'
            }

ship_keys = { 's': SCOUT,
              'd': DESTROYER,
              'c': CRUISER,
              'b': BATTLESHIP,
              'a': ASSAULT,
              'o': STARBASE,
              'g': SGALAXY,
              '*': ATT }

PLREPAIR = 0x010
PLFUEL = 0x020
PLAGRI = 0x040
PLREDRAW = 0x080
PLHOME = 0x100
PLCOUP = 0x200
PLCHEAP = 0x400
PLCORE = 0x800
PLCLEAR = 0x1000

PHFREE=0x00
PHHIT =0x01 // ship
PHMISS=0x02 // whiff
PHHIT2=0x04 // plasma

MVALID = 0x01
MGOD   = 0x10

MINDIV = 0x02
MCONFIG = 0x40

MTEAM  = 0x04
MTAKE  = 0x20
MDEST  = 0x40
MBOMB  = 0x60
MCOUP1 = 0x80
MCOUP2 = 0xA0
MDISTR = 0xC0

MALL   = 0x08
MGENO  = 0x20
MCONQ  = 0x20
MKILLA = 0x40
MKILLP = 0x60
MKILL  = 0x80
MLEAVE = 0xA0
MJOIN  = 0xC0
MGHOST = 0xE0

COMM_TCP        = 0
COMM_UDP        = 1
COMM_VERIFY     = 2
COMM_UPDATE     = 3
COMM_MODE       = 4

CONNMODE_PORT   = 0
CONNMODE_PACKET = 1

SWITCH_TCP_OK   = 0
SWITCH_UDP_OK   = 1
SWITCH_DENIED   = 2
SWITCH_VERIFY   = 3

BADVERSION_SOCKET  = 0 // CP_SOCKET version does not match, exiting
BADVERSION_DENIED  = 1 // access denied by netrekd
BADVERSION_NOSLOT  = 2 // no slot on queue
BADVERSION_BANNED  = 3 // banned
BADVERSION_DOWN    = 4 // game shutdown by server
BADVERSION_SILENCE = 5 // daemon stalled
BADVERSION_SELECT  = 6 // internal error

GU_GAMEOK       =    0x1
GU_UNSAFE       =    0x1 // not currently safe due idle
GU_PRACTICE     =    0x2 // Basepractice robot is present, also set by INL robot
                         // during a pause, in pre-game, or post-game
GU_CHAOS        =    0x4 // also set by INL robot in post-game
GU_PAUSED       =    0x8
GU_INROBOT      =   0x10 // INL robot is present
GU_NEWBIE       =   0x20 // Newbie robot is present
GU_PRET         =   0x40 // Pre-t robot is present
GU_BOT_IN_GAME  =   0x80 // Pre-t robot + bots are present
GU_CONQUER      =  0x100 // conquest parade in progress
GU_PUCK         =  0x200 // Hockey robot is present
GU_DOG          =  0x400 // Dogfight robot is present
GU_INL_DRAFTING =  0x800 // INL draft pre-game is in progress
GU_INL_DRAFTED  = 0x1000 // INL draft game is in progress

// Plasma Torpedo states

PTFREE = 0
PTMOVE = 1
PTEXPLODE = 2
PTDET = 3

// ship stats
shipStats = {};
shipStats[SCOUT] = {
    speed: 12,
    maxArmies: 2,
    shields: 75,
    hull: 75,
    fuel: 5000 
}
shipStats[DESTROYER] = {
    speed: 10,
    maxArmies: 5,
    shields: 85,
    hull: 85,
    fuel: 7000 
}
shipStats[CRUISER] = {
    speed: 9,
    maxArmies: 10,
    shields: 100,
    hull: 100,
    fuel: 10000 
}
shipStats[BATTLESHIP] = {
    speed: 8,
    maxArmies: 6,
    shields: 130,
    hull: 130,
    fuel: 14000 
}
shipStats[ASSAULT] = {
    speed: 8,
    maxArmies: 20,
    shields: 80,
    hull: 200,
    fuel: 6000 
}
shipStats[STARBASE] = {
    speed: 2,
    maxArmies: 25,
    shields: 500,
    hull: 600,
    fuel: 60000 
}


