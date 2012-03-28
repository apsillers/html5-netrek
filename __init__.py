#!/usr/bin/python

"""
    netrek client pygame, aka gytha
    Copyright (C) 2007-2011  James Cameron (quozl@us.netrek.org)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

http://www.cs.cmu.edu/afs/cs.cmu.edu/user/jch/netrek/humor

From: markiel@callisto.pas.rochester.edu (Andrew Markiel)
Newsgroups: rec.games.netrek
Subject: Re: Beginer!
Date: Thu, 4 Nov 93 00:33:05 GMT

STHOMAS@utcvm.utc.edu wrote:
>      I read many of the netrek postings and it seems real intresting.  Would
> anyone be willing to post instructions on how to get onto Netrek and begin
> playinf.  Particularly comand cods to get in.

Certainly! Most of them you can fish out of the code (it's written in sea),
but I can give you some pointers.

The idea behind netrek is that your race starts with 10 oysters, which
produce pearls (certain "agricultural" oysters produce pearls much faster
and thus are very valuable). The object of the game is to capture all of
the enemy's oysters by destroying all of their pearls and capturing them
with your own pearls. Each team has 8 fish attacking and defending the
oysters.

One of the most important ideas is to destroy enemy pearls (once you
destroy all the pearls on an enemy oyster, it becomes uncontrolled and
you can capture it by delivering one of your own pearls). You do this
by perching on the oyster and hitting 'b' (for bash), which causes
you to destroy the enemy pearls there.

If the oyster has more than 4 pearls, then it will be open and you
can attack all of them; however, once the oyster has less than 5, it
will close up with the pearls inside and you can't bash them anymore
(however, if you get lucky, you can bash several pearls in one swing
and thus reduce the number of pearls to below 4 before it closes up..
lobsters are very good at this).

Once the oyster is closed up, the only way to destroy the rest of the
pearls inside is to deliver your own pearls to the oyster. When you
put one of your own pearls next to the oyster, it will open up slightly
to crush it, which allows you to grab one of the ones inside and destroy
it before it closes again. Thus, for an oyster with 4 pearls, you need
to deliver 4 of your own pearls to be able to destroy all of the ones
inside, which makes the oyster uncontrolled. Then, if you put another
one of your own pearls inside, you will capture the oyster and it will
start making pearls for you.

The tricky bit is that to carry pearls around, you have to have a net
to carry them in. You make the net out of the scales of the enemy fish
that you defeat. Defeating one enemy fish gives you enough scales to
carry 2 pearls (unless you are in a lobster, in which case you have
enough to carry three pearls). They maximum number of pearls you can
carry depends on fish type. When your fish is defeated in combat,
you lose all your scales and any pearls you are carrying, and get sent
back to your spawning grounds to get a new fish. 

You fight either by tossing pebbles at the enemy fish, or by using
your scraper to scrape the scales off of them; note that after a
lot of fighting you get tired, and can't attack until you get more food
(indicated by your food stat, note that many other things, including
movement, consume food). You can get a little food anywhere, but certain
oysters provide food, which means that if you perch on a freindly food
oyster you will replace your food reserves much faster.

There are six types of fish you can control: salmon, dogfish, crabs,
bluefin, lobsters, and the mighty bass. You can always switch to
another fish by going back to your spawning ground and requesting
a new fish (and you keep whatever scales you had).

Salmon are small and fast. The have fast pebbles but very weak
scrapers, and they are too weak for most combat. They are best used
either for carrying pearls, or for bashing enemy pearls in their
backfield (every good team needs a salmon basher).

Dogfish are a little tougher than salmon, and also conserve food well.
However, they also have weak scrapers and thus aren't so useful in combat.
In fact, these fish tend to be seldom seen anymore.

Crabs are the workfish. They have lots of food and really good
scrapers, which makes them good for fighting enemy fish. Nowadays
these fish are used more than any other.

Bluefin are very big fish, but are slow and don't use food effectively,
so they tend to be useful only in close range fights near a food oyster.

Lobsters are an intersting sort of fish. They are very slow, but are
very good at bashing enemy pearls (if they get lucky, they can bash
4 pearls in one swing). They also can carry three pearls for each
enemy fish destroyed, which can be quite useful.

The bass is a very special fish. You side only can have one at a time,
and if it gets defeated it takes 30 minutes to put it back together
again. You also have a certain rank to take one. However, they are
very big and tough, and serve as a repository for pearls (where they
can't be bashed).

An interesting tactic is the bass og (it's short for ogtopus). This
is where your 8 fish surround the enemy bass (like the 8 arms of an
ogtopus). Then you wade in and beat the carp out of him. You can do
it with less fish, but it's not as effective.


Hope this helps. If you have more questions, the FAQ should be posted
in a few days.

> Stephen Thomas  University of Tennesee at Chattanooga

-Grey Elf
markiel@callisto.pas.rochester.edu

"""
import sys, time, socket, errno, select, struct, pygame, math, ctypes

from pygame.locals import *

# a global namespace until complexity grows too far
from cache import ic, fc
from constants import *
from sprites import MultipleImageSprite
from sprites import Icon, Text, Texts
from sprites import IconButton, IconTextButton, HorizontalAssemblyButton, Field
from bouncer import Bouncer
from util import *
from meta import MetaClient
from client import Client, ServerDisconnectedError
from motd import MOTD
from cap import Cap
import mercenary
import options
import rcd

VERSION = "0.8"

WELCOME = [
"Gytha %s" % (VERSION),
"Copyright (C) 2007-2011 James Cameron <quozl@us.netrek.org>",
"",
"This program comes with ABSOLUTELY NO WARRANTY; for details see source.",
"This is free software, and you are welcome to redistribute it under certain",
"conditions; see source for details."
]

INSTRUCTIONS_SERVERS = [
'Welcome to Netrek, a multi-player real-time 2D strategy game.',
'',
'Pick a server to begin playing.',
'',
'Each Netrek galaxy is shared to players through a server.  These servers are',
'listed here, from the Netrek metaserver.  Number of players is shown to the',
'right.  Click on a server with your middle mouse button to join as an',
'anonymous mercenary, or with your left button to login.'
]

FONT_SANS = 'DejaVuSans.ttf'
FONT_SANS_MONO = 'DejaVuSansMono.ttf'
FONT_SANS_CONDENSED = 'DejaVuSansCondensed.ttf'

# number of rounds played this session
rounds = 0

# rectangle of entire window
# changed when screen capabilities are determined
r_main = Rect((0, 0), (1100, 1100))

# rectangle of tactical and galactic area inside entire window
r_us = Rect((50, 50), (1000, 1000))

#
# there are several different coordinate types:
#
# 1.  netrek coordinates: represent a position of a game object, are
# used by the netrek protocol, and are a cartesian pair normally
# ranging from (0, 0) to (GWIDTH, GWIDTH)
#
# 2.  netrek direction: represent a vector from your own ship out into
# surrounding space, are used by the netrek protocol, and are a value
# of range 0 to 255, representing a full circle,
#
# 3.  tactical screen coordinates: represent a position on screen
# relative to the main window, matching a netrek coordinate relative
# to your own ship, are local to the client, are not used in the
# netrek protocol, and range from (0, 0) to the main window, r_main,
#
# 4.  galactic screen coordinates: represent a position on screen
# relative to the main window, matching a netrek coordinate which is
# absolute, are local to the client, are not used in the netrek
# protocol, and have the same range as above.
#
# the following functions are for conversions between these coordinate
# types.
#

def n2ss(x, y):
    """ netrek to subgalactic screen coordinate conversion
    """
    return (x / subgalactic_factor + r_sg.left,
            y / subgalactic_factor + r_sg.top)

def n2gs(x, y):
    """ netrek to galactic screen coordinate conversion
    """
    return (x / galactic_factor + r_us.left,
            y / galactic_factor + r_us.top)

def n2ts(me, x, y):
    """ netrek to tactical screen coordinate conversion
    """
    return ((x - me.x) / 20 + r_us.centerx,
            (y - me.y) / 20 + r_us.centery)

def gs2n(x, y):
    """ galactic screen to netrek coordinate conversion
    """
    return ((x - r_us.left) * galactic_factor,
            (y - r_us.top) * galactic_factor)

def ts2n(me, x, y):
    """ tactical screen to netrek coordinate conversion
    """
    return ((x - r_us.centerx) * 20 + me.x,
            (y - r_us.centery) * 20 + me.y)

def s2g(me, x, y):
    if ph_flight == ph_galactic: # forward reference (ph_*)
        return gs2n(x, y)
    else:
        return ts2n(me, x, y)

def cursor(me):
    """ return the netrek coordinates of the mouse cursor """
    x, y = pygame.mouse.get_pos()
    return s2g(me, x, y)

def intragalactic(xy):
    x, y = xy
    return (0 < x < GWIDTH) and (0 < y < GWIDTH)

def d2a(dir):
    """ convert netrek direction (0-255) to angle in degrees (0-359)
    """
    return dir * 360 / 256

def s2d(me, x, y):
    """ screen coordinate to netrek direction (0-255) conversion """
    if ph_flight == ph_galactic: # forward reference (ph_*)
        (mx, my) = n2gs(me.x, me.y)
    else:
        (mx, my) = n2ts(me, me.x, me.y)
    return int((math.atan2(x - mx, my - y) / math.pi * 128.0 + 0.5))


class Local:
    """ netrek game objects, corresponding to objects in the game """
    def __init__(self, n):
        self.n = n
        self.tactical = None # pygame sprite on tactical
        self.galactic = None # pygame sprite on galactic

    def __repr__(self):
        return 'Local(n=%r,\ntactical=%r,\ngalactic=%r)\n' % \
            (self.n, self.tactical, self.galactic)

    def op_info_update(self):
        for sprite in b_info:
            if sprite.track != self:
                return
            if not sprite.alive():
                return
            sprite.lines = self.op_info()
            sprite.pick()
            sprite.update()


class Planet(Local):
    """ netrek planets
        each server has a number of planets
        instances are created as packets about the planets are received
        instances are listed in a dictionary of planets in the galaxy
        instance
    """
    def __init__(self, n):
        Local.__init__(self, n)
        self.x = self.y = -10001
        self.name = ''
        self.owner = self.info = self.flags = self.armies = 0
        self.tactical = PlanetTacticalSprite(self) # forward reference
        self.galactic = PlanetGalacticSprite(self) # forward reference
        self.nearby = False

    def __repr__(self):
        return Local.__repr__(self) + ('.Planet(name=%s)\n' % self.name)

    def sp_planet_loc(self, x, y, name):
        old = (self.x, self.y, self.name)
        if self.x != x or self.y != y:
            self.x = x
            self.y = y
            self.set_box(x, y)
        self.name = name.split('\0')[0]
        if old != (self.x, self.y, self.name):
            self.op_info_update()

    def sp_planet(self, owner, info, flags, armies):
        old = (self.owner, self.info, self.flags, self.armies)
        self.owner = owner
        self.info = info
        self.flags = flags
        self.armies = armies
        if old != (self.owner, self.info, self.flags, self.armies):
            self.op_info_update()

    def op_info(self):
        lines = ['%s (a planet)' % self.name, '']
        if self.info & me.team:
            if self.armies != 0:
                lines.append(teams_long[self.owner].title() + ' ')
                lines.append('Armies %r' % self.armies)
            else:
                lines.append('Independent, no armies')
            lines.append('')
            if self.flags & PLFUEL: lines.append('FUELS')
            if self.flags & PLREPAIR: lines.append('REPAIRS')
            if self.flags & PLAGRI: lines.append('AGRICULTURAL')
            if self.flags & PLHOME: lines.append('HOME')
            if self.flags & PLCHEAP: lines.append('CHEAP')
            if self.flags & PLCORE: lines.append('CORE')
            for team in teams_playable:
                if self.info & team:
                    if team != self.owner:
                        name = teams_long[team].title()
                        lines.append('Scanned by %s ' % name)
        else:
            lines.append('Not scanned, please orbit to scan')
        return lines

    def set_box(self, x, y):
        """ create a proximity bounding box around the planet """
        t = 13000
        wx = t * 2
        wy = t * 2
        sx = self.x - t
        sy = self.y - t
        if sx < 0:
            wx += sx
            sx = 0
        if sy < 0:
            wy += sy
            sy = 0
        self.box = pygame.Rect(sx, sy, wx, wy)

    def proximity(self, x, y):
        """ set planet visibility on tactical if we are within range """
        if self.box.collidepoint(x, y):
            if not self.nearby:
                self.nearby = True
                self.tactical.show()
        else:
            if self.nearby:
                self.nearby = False
                self.tactical.hide()


class Ship(Local):
    """ netrek ships
        each server has a number of netrek ships, normally 32 (MAXPLAYER)
        instances created as packets about the ships are received
        instances are listed in a dictionary of ships in the galaxy instance
    """
    def __init__(self, n):
        Local.__init__(self, n)
        # sp_pl_login
        self.rank = 0
        self.name = ''
        self.monitor = ''
        self.login = ''
        # sp_hostile
        self.war = 0
        self.hostile = 0
        # sp_player_info
        self.shiptype = CRUISER
        self.cap = galaxy.caps[CRUISER]
        self.team = 0
        self.mapchars = ''
        # sp_kills
        self.kills = 0 # hundredths
        self.sp_kills_me_shown = False
        # sp_player
        self.dir = 0
        self.speed = 0
        self.sp_player_me_speed_shown = False
        self.x = self.px = -10000
        self.y = self.py = -10000
        self.nearby = False
        # sp_flags
        self.flags = 0
        # sp_pstatus
        self.status = PFREE
        # sp_generic_32
        self.repair_time = 0
        self.pl_orbit = -1
        self.repair_time_shown = False

        self.planet = None # planet we last locked on if flags & PFPLLOCK

        self.tactical = ShipTacticalSprite(self) # forward reference
        self.galactic = ShipGalacticSprite(self) # forward reference
        self.ppcf = 1 # planet proximity check fuse
        self.fuse = None

    def __repr__(self):
        return Local.__repr__(self) + ('.Ship(n=%r)\n' % (self.n))

    def op_info(self):
        lines = ['%s %s (a ship)' % (self.mapchars, self.name), '']
        # FIXME: tell more about self
        lines.append(teams_long[self.team].title())
        lines.append(ships_long[self.shiptype].title() +
                     ' (' + ships_use[self.shiptype].title() + ')')
        lines.append('')
        if self.kills > 0:
            lines.append('Kills %.2f' % (self.kills / 100.0))
        else:
            lines.append('Mostly harmless')
        lines.append('')
        if self.team == me.team:
            lines.append('Is on your team')
        else:
            if self.war & me.team:
                lines.append('At war with you')
            else:
                if self.hostile & me.team:
                    lines.append('Hostile to you')
                else:
                    lines.append('At peace with you')
        lines.append('')
        if self.flags & PFSHIELD: lines.append('SHIELDS')
        if self.flags & PFBOMB: lines.append('BOMBING')
        if self.flags & PFORBIT: lines.append('ORBITING')
        if self.flags & PFCLOAK: lines.append('CLOAKED')
        if self.flags & PFROBOT: lines.append('ROBOT')
        if self.flags & PFPRACTR: lines.append('PRACTICE ROBOT')
        if self.flags & PFDOCK: lines.append('DOCKED')
        if self.flags & PFDOCKOK: lines.append('DOCKING PERMITTED')
        if self.flags & PFTWARP: lines.append('TRANSWARP ENGAGED')
        if self.flags & PFBPROBOT: lines.append('INTELLIGENT ROBOT')
        if self == me: lines.append('(this is you, by the way)')
        return lines

    def visibility(self):
        if self.status == PALIVE or self.status == PEXPLODE:
            self.galactic.show()
            if self == me or self.nearby:
                self.tactical.show()
            else:
                self.tactical.hide()
        else:
            self.galactic.hide()
            self.tactical.hide()

    def sp_you(self, hostile, swar, armies, flags, damage, shield,
               fuel, etemp, wtemp, whydead, whodead):
##         if me == self:
##             if not self.flags & PFSHIELD:
##                 if flags & PFSHIELD:
##                     sound_off.play()
        self.hostile = hostile
        self.swar = swar
        self.armies = armies
        self.flags = flags
        self.damage = damage
        self.shield = shield
        self.fuel = fuel
        self.etemp = etemp
        self.wtemp = wtemp
        self.whydead = whydead # FIXME: display this data, on death
        self.whodead = whodead # FIXME: display this data, on death
        self.sp_you_shown = False
        self.nearby = True
        global me
        if not me:
            me = self
        else:
            if me != self:
                me = self

    def sp_pl_login(self, rank, name, monitor, login):
        self.rank = rank
        self.name = name.split('\0')[0]
        self.monitor = monitor
        self.login = login
        # FIXME: display this data, on player list

    def sp_hostile(self, war, hostile):
        self.war = war
        self.hostile = hostile
        self.op_info_update()
        # FIXME: display this data, on player list

    def sp_player_info(self, shiptype, team):
        self.shiptype = shiptype
        self.cap = galaxy.caps[shiptype]
        self.team = team
        self.mapchars = '%s%s' % (teams[team][:1].upper(), slot_decode(self.n))
        self.op_info_update()
        # FIXME: display this data, on player list

    def sp_kills(self, kills):
        global me
        if me == self:
            if self.kills != kills:
                self.sp_kills_me_shown = False
        self.kills = kills
        self.op_info_update()
        # FIXME: display this data, on player list

    def sp_player(self, dir, speed, x, y):
        global me
        if me == self:
            if self.x < 0 and x > 0:
                self.px = self.x = x
                self.py = self.y = y
                # forward reference to enclosing class
                galaxy.planets_proximity_check()
            if self.speed != speed:
                self.sp_player_me_speed_shown = False
        elif me:
            limit = TWIDTH / 2 + TWIDTH / 4
            nearby = (abs(me.x - x) < limit) or (abs(me.x - x) < limit)
            if nearby != self.nearby:
                self.nearby = nearby
                self.visibility()
        self.dir = d2a(dir)
        self.speed = speed
        self.x = x
        self.y = y
        # FIXME: display speed on tactical

        # FIXME: potential optimisation, set a bounding box of no
        # further check required, by taking the minima and maxima of
        # the planet zones of unseen planets.
        if me == self:
            self.ppcf -= 1
            if self.ppcf < 0:
                if abs(self.x - self.px) > 1000 or abs(self.y - self.py) > 1000:
                    self.px = self.x
                    self.py = self.y
                    # forward reference to enclosing class
                    galaxy.planets_proximity_check()
                self.ppcf = 20

    def sp_flags(self, flags):
        self.flags = flags
        self.op_info_update()

    def sp_pstatus(self, status):
        # was alive now exploding
        if self.status == PALIVE and status == PEXPLODE:
            galaxy.se.append(self)
            self.fuse = 10 * galaxy.ups / 10
        # was exploding now not
        if self.status == PEXPLODE and status != PEXPLODE:
            if self in galaxy.se:
                galaxy.se.remove(self)
        # store the status
        self.status = status
        # ship sprite visibility is brutally controlled by status
        # FIXME: do not show cloaked ships
        self.visibility()

    def sp_generic_32(self, repair_time, pl_orbit):
        self.repair_time = repair_time
        self.pl_orbit = pl_orbit
        self.repair_time_shown = False

    def debug_draw(self):
        fx = 900
        fy = self.n * 30
        tx = 900 - (self.status * 10)
        ty = fy
        p = pygame.draw.line(screen, (255, 255, 255), (fx, fy), (tx, ty))
        q = pygame.draw.line(screen, (0, 0, 0), (tx, ty), (tx - 200, ty))
        return pygame.Rect.union(p, q)

    def aging(self):
        """ if ship is exploding, decrement the explosion sequence fuse """
        if self.status == PEXPLODE:
            self.fuse -= 1


class Torp(Local):
    """ netrek torps
        each netrek ship has eight netrek torps
        instances created as packets about the torps are received
        instances are listed in a dictionary of torps in the galaxy instance
    """
    def __init__(self, n, galaxy):
        Local.__init__(self, n)
        self.n = n
        self.galaxy = galaxy
        self.ship = self.galaxy.ship(self.n / MAXTORP)
        self.fuse = 0
        self.status = TFREE
        self.sp_torp_info(0, self.status)
        self.sp_torp(0, 0, 0)
        self.tactical = TorpTacticalSprite(self) # forward reference

    def __repr__(self):
        return Local.__repr__(self) + ('.Torp(n=%r, ship.n=%r, fuse=%r, status=%r)\n' % (self.n, self.ship.n, self.fuse, self.status))

    def sp_torp_info(self, war, status):
        was = self.status
        self.war = war
        self.status = status
        if was == TFREE:
            if status != TFREE:
                if self not in self.galaxy.torps:
                    self.galaxy.torps[self.n] = self
                try: self.tactical.show()
                except: pass
        else:
            if status == TFREE:
                try: self.tactical.hide()
                except: pass
                self.x = -10000
                self.y = -10000
                del self.galaxy.torps[self.n]
            elif status == TEXPLODE:
                self.galaxy.te.append(self)
                NUMDETFRAMES = 10
                self.fuse = NUMDETFRAMES * galaxy.ups / 10;
                # FIXME: animate torp explosions over local time?
                # They vary according to update rate.

    def sp_torp(self, dir, x, y):
        self.dir = dir
        self.x = x
        self.y = y

    def aging(self):
        """ if torp is exploding, decrement the explosion sequence fuse """
        if self.status == TEXPLODE:
            self.fuse -= 1
            if self.fuse <= 0:
                self.galaxy.te.remove(self)
                self.tactical.hide()
                self.x = -10000
                self.y = -10000
                self.status = TFREE
                del self.galaxy.torps[self.n]
        else:
            self.galaxy.te.remove(self)

    def debug_draw(self):
        fx = 0
        fy = self.n * 3
        tx = self.status * 50
        ty = fy
        p = pygame.draw.line(screen, (255, 255, 255), (fx, fy), (tx, ty))
        q = pygame.draw.line(screen, (0, 0, 0), (tx, ty), (tx + 200, ty))
        return pygame.Rect.union(p, q)


class Plasma(Local):
    """ netrek plasma torps
        each netrek ship has one netrek plasma torp
        instances created as packets about the plasma torps are received
        instances are listed in a dictionary in the galaxy instance
    """
    def __init__(self, n):
        Local.__init__(self, n)
        self.ship = galaxy.ship(n) # forward reference to enclosing class
        self.fuse = 0
        self.status = PTFREE
        self.sp_plasma_info(0, self.status)
        self.sp_plasma(0, 0)
        self.tactical = PlasmaTacticalSprite(self)

    def sp_plasma_info(self, war, status):
        old = self.status

        self.war = war
        self.status = status

        try:
            if old == PTFREE:
                if status != PTFREE:
                    self.tactical.show()
            else:
                if status == PTFREE:
                    self.tactical.hide()
                elif status == PTEXPLODE:
                    self.galaxy.pe.append(self)
                    self.fuse = NUMDETFRAMES * galaxy.ups / 10;
        except:
            pass

    def sp_plasma(self, x, y):
        self.x = x
        self.y = y

    def aging(self):
        """ if torp is exploding, decrement the explosion sequence fuse """
        if self.status == PTEXPLODE:
            self.fuse -= 1
            if self.fuse <= 0:
                self.galaxy.pe.remove(self)
                self.tactical.hide()
                self.x = -10000
                self.y = -10000
                self.status = PTFREE


class Phaser(Local):
    """ netrek phasers
        each netrek ship has one netrek phaser
        instances created as packets about the phasers are received
        instances are listed in a dictionary of phasers in the galaxy instance
        (instances of this class are jointly a model and view)
    """
    def __init__(self, n):
        Local.__init__(self, n)
        self.ship = galaxy.ship(n) # forward reference to enclosing class
        self.status = PHFREE
        self.want = False # is to be drawn on screen
        self.have = False # has been drawn on screen
        self.sp_phaser(0, 0, 0, 0, 0)

    def draw(self):
        self.have = True
        if self.status == PHMISS: # phaser missed, did not hit anything
            s_phaserrange = self.ship.cap.s_phaserrange
            phasedist = 6000
            factor = phasedist * s_phaserrange / 100
            angle = ( self.dir - 64 ) / 128.0 * math.pi
            tx = int(factor * math.cos(angle))
            ty = int(factor * math.sin(angle))
            (tx, ty) = n2ts(me, self.ship.x + tx, self.ship.y + ty)
            (fx, fy) = n2ts(me, self.ship.x, self.ship.y)
        elif self.status == PHHIT2: # phaser hit a plasma owned by target ship
            target = galaxy.plasma(self.target)
            (tx, ty) = n2ts(me, target.x, target.y)
            (fx, fy) = n2ts(me, self.ship.x, self.ship.y)
        elif self.status == PHHIT: # phaser hit a target ship
            target = galaxy.ship(self.target) # forward reference to enclosing class
            (tx, ty) = n2ts(me, target.x, target.y)
            (fx, fy) = n2ts(me, self.ship.x, self.ship.y)
        self.txty = (tx, ty)
        self.fxfy = (fx, fy)
        if self.ship == me:
            colour = (255, 255, 255)
        else:
            colour = brighten(team_colour(self.ship.team))
	    # FIXME: incorrect colours have been sighted
        return pygame.draw.line(screen, colour, (fx, fy), (tx, ty))

    def undraw(self, colour):
        self.have = False
        return pygame.draw.line(screen, colour, self.fxfy, self.txty)

    def sp_phaser(self, status, direction, x, y, target):
        old = self.status

        self.status = status
        self.dir = direction
        self.x = x
        self.y = y
        self.target = target

        if old == PHFREE:
            if self.status != PHFREE: self.want = True
        else:
            if self.status == PHFREE: self.want = False


class Tractor(Local):
    """ netrek tractors
        each netrek ship has one tractor

        Note: other player tractors are not shown unless server has
        SHOW_ALL_TRACTORS set in etc/features
    """
    def __init__(self, n, ship):
        Local.__init__(self, n)
        self.ship = ship
        self.flags = self.target = 0
        self.want = False # is to be drawn on screen
        self.have = False # has been drawn on screen

    def draw(self):
        if self.ship.status != PALIVE:
            self.want = False
            return
        self.have = True
        them = galaxy.ship(self.target & (~0x40))
        self.txty = n2ts(me, them.x, them.y)
        self.fxfy = n2ts(me, self.ship.x, self.ship.y)
        # FIXME: use dotted line centre of tractor to periphery of
        # tractee, as per original design of netrek clients
        colour = (0, 64, 0)
        if self.flags & PFPRESS:
            colour = (64, 0, 0)
        return pygame.draw.line(screen, colour, self.fxfy, self.txty, 10)

    def undraw(self, colour):
        self.have = False
        return pygame.draw.line(screen, colour, self.fxfy, self.txty, 10)

    def sp_tractor(self, flags, target):
        self.want = False
        if target & 0x40:
            if flags & (PFTRACT | PFPRESS):
                if self.ship.status == PALIVE:
                    self.want = True
        self.flags = flags
        self.target = target


class Tag(Local):
    def __init__(self, xy):
        Local.__init__(self, 0)
        self.x, self.y = xy


class NegativeEnergyBarrier(Tag):
    def __init__(self, xy):
        Tag.__init__(self, xy)

    def op_info(self):
        return ['Negative Energy Barrier',
                '',
                'The edge of the playing area.',
                '',
                'Ships bounce off this harmlessly.',
                'Torpedos explode damaging ships nearby.',
                'Phasers do nothing.']


class Galaxy:
    """ structure to contain all netrek game objects """
    def __init__(self):
        self.planets = {}
        self.ships = {}
        self.torps = {}
        self.te = [] # exploding torps
        self.se = [] # exploding ships
        self.pe = [] # exploding plasma
        self.phasers = {}
        self.tractors = {}
        self.plasmas = {}
        self.caps = {}
        for n in range(NUM_TYPES):
            self.caps[n] = Cap(n)
        self.motd = MOTD()
        self.ups = 5 # default if SP_FEATURE UPS is not received
        self.rps = 1 # tactical or galactic redraws per second
        self.frames = 0 # number of protocol paced screen updates done
        self.events = 0 # number of display events received
        # sp_generic_32
        self.gameup = 0
        self.tournament_teams = 0
        self.tournament_age = 0
        self.tournament_age_units = 's'
        self.tournament_remain = 0
        self.tournament_remain_units = 's'
        self.starbase_remain = 0
        self.team_remain = 0
        # sp_queue
        self.sp_queue_pos = None
        self.message = None # the MessageSprite
        # sp_sequence
        self.paced = False

    def __repr__(self):
        return 'Galaxy(\nships=%r, \ntorps=%r)\n' % (self.ships, self.torps)

    def pace(self):
        """ called when server packets indicate an update burst is starting """
        self.paced = True
        self.plasma_aging()
        self.torp_aging()
        self.ship_aging()

    def planet(self, n):
        if n not in self.planets:
            self.planets[n] = Planet(n)
        return self.planets[n]

    def planets_proximity_check(self):
        for n, planet in self.planets.iteritems():
            planet.proximity(me.x, me.y)

    def ship(self, n):
        if n not in self.ships:
            self.ships[n] = Ship(n)
        return self.ships[n]

    def ship_aging(self):
        for s in self.se:
            s.aging()

    def ship_debug_draw(self):
        r = []
        for n, ship in self.ships.iteritems():
            r.append(ship.debug_draw())
        return r

    def torp(self, n):
        if n in self.torps:
            return self.torps[n]
        return Torp(n, self)

    def torp_aging(self):
        for t in self.te:
            t.aging()

    def torp_debug_draw(self):
        r = []
        for n, torp in self.torps.iteritems():
            r.append(torp.debug_draw())
        return r

    def plasma_aging(self):
        for p in self.pe:
            p.aging()

    def phaser(self, n):
        if n not in self.phasers:
            self.phasers[n] = Phaser(n)
        return self.phasers[n]

    def phasers_undraw(self, colour):
        r = []
        for n, phaser in self.phasers.iteritems():
            if phaser.have: r.append(phaser.undraw(colour))
        return r

    def phasers_draw(self):
        r = []
        for n, phaser in self.phasers.iteritems():
            if phaser.want: r.append(phaser.draw())
        return r

    def tractor(self, n, ship):
        if n not in self.tractors:
            self.tractors[n] = Tractor(n, ship)
        return self.tractors[n]

    def tractors_undraw(self, colour):
        r = []
        for n, tractor in self.tractors.iteritems():
            if tractor.have: r.append(tractor.undraw(colour))
        return r

    def tractors_draw(self):
        r = []
        for n, tractor in self.tractors.iteritems():
            if tractor.want: r.append(tractor.draw())
        return r

    def plasma(self, n):
        if n not in self.plasmas:
            self.plasmas[n] = Plasma(n)
        return self.plasmas[n]

    def cap(self, n):
        if n not in self.caps:
            self.caps[n] = Cap(n)
        return self.caps[n]

    def is_enemy(self, thing):
        return thing.team != me.team

    def is_friend(self, thing):
        return thing.team == me.team

    def is_alive(self, thing):
        return thing.status == PALIVE

    def closest(self, xy, things, checks):
        """ return the closest thing to galactic coordinates,
            ignoring me,
            but return me if nothing found.
        """
        x, y = xy
        closest = me
        minimum = GWIDTH**2
        for n, thing in things.iteritems():
            if thing == me: continue
            disinterest = False
            for check in checks:
                if not check(thing):
                    disinterest = True
                    break
            if disinterest: continue
            distance = (thing.x - x)**2 + (thing.y - y)**2
            if distance < minimum:
                closest = thing
                minimum = distance
        return closest

    def closest_planet(self, xy):
        """ return the closest planet to galactic coordinates """
        return self.closest(xy, self.planets, [])

    def closest_ship(self, xy):
        """ return the closest ship to galactic coordinates """
        return self.closest(xy, self.ships, [self.is_alive])

    def closest_enemy(self, xy):
        """ return the closest hostile player to coordinates """
        return self.closest(xy, self.ships, [self.is_enemy, self.is_alive])

    def closest_friend(self, xy):
        """ return the closest friendly player to coordinates """
        return self.closest(xy, self.ships, [self.is_friend, self.is_alive])

    def closest_thing(self, xy):
        """ return the closest thing to coordinates """
        if not intragalactic(xy):
            return NegativeEnergyBarrier(xy)
        cs = self.closest_ship(xy)
        cp = self.closest_planet(xy)
        x, y = xy
        dm = (me.x - x)**2 + (me.y - y)**2
        ds = (cs.x - x)**2 + (cs.y - y)**2
        dp = (cp.x - x)**2 + (cp.y - y)**2
        if dm < ds and dm < dp: return me
        if cs == me and cp != me: return cp
        if cs != me and cp == me: return cs
        if ds < dp: return cs
        return cp

    def sp_message(self, m_flags, m_recipt, m_from, mesg):
        if m_flags == (MVALID | MTEAM | MDISTR):
            d = rcd.msg()
            d.unpack(m_recipt, m_from, mesg)
            text = d.text(galaxy)
            # FIXME: portray RCDs graphically, e.g. action bubbles near ships
        else:
            text = strnul(mesg)
        if self.message != None:
            self.message.append(m_flags, m_recipt, m_from, text)

    def sp_generic_32(self, gameup, tournament_teams, \
                tournament_age, tournament_age_units, tournament_remain, \
                tournament_remain_units, starbase_remain, team_remain):
        self.gameup = gameup
        self.tournament_teams = tournament_teams
        self.tournament_age = tournament_age
        self.tournament_age_units = tournament_age_units
        self.tournament_remain = tournament_remain
        self.tournament_remain_units = tournament_remain_units
        self.starbase_remain = starbase_remain
        self.team_remain = team_remain

    def sp_queue(self, pos):
        self.sp_queue_pos = pos

galaxy = Galaxy()
me = None

class PlanetSprite(MultipleImageSprite):
    """ netrek planet sprites
    """
    def __init__(self, planet):
        self.planet = planet
        self.old = None
        self.tag = None
        self.icon = None
        MultipleImageSprite.__init__(self)

class PlanetGalacticSprite(PlanetSprite):
    """ netrek planet sprite on galactic """
    def __init__(self, planet):
        PlanetSprite.__init__(self, planet)
        self.pick()
        g_planets.add(self)

    def add_armies(self):
        if self.planet.armies == 0:
            return
        tag = pygame.Surface((30, 74), pygame.SRCALPHA, 32)
        message = "%d" % (self.planet.armies)
        colour = (128, 128, 128)
        if self.planet.flags & PLAGRI:
            colour = (255, 255, 255)
        font = fc.get(FONT_SANS, 12)
        text = font.render(message, 1, colour)
        rect = text.get_rect(top=0, centerx=15)
        tag.blit(text, rect)
        self.mi_add_image(tag)

    def add_flags(self):
        if not self.planet.flags & (PLFUEL | PLREPAIR):
            return
        pos = 70
        tag = pygame.Surface((pos, 30), pygame.SRCALPHA, 32)
        colour = team_colour(self.planet.owner)
        if self.planet.flags & PLFUEL:
            font = fc.get(FONT_SANS, 12)
            text = font.render('F', 1, colour)
            rect = text.get_rect(left=0, centery=15)
            tag.blit(text, rect)
        if self.planet.flags & PLREPAIR:
            font = fc.get(FONT_SANS, 12)
            text = font.render('R', 1, colour)
            rect = text.get_rect(right=pos, centery=15)
            tag.blit(text, rect)
        self.mi_add_image(tag)

    def add_icon(self):
        # IMAGERY: planet-???-30x30.png
        # TODO: add agri planet 30x30 png files
        self.icon = ic.get("planet-" + teams[self.planet.owner] + "-30x30.png")
        self.mi_add_image(self.icon)

    def add_name(self):
        if self.planet.name == '':
            return
        tag = pygame.Surface((92, 74), pygame.SRCALPHA, 32)
        font = fc.get(FONT_SANS, 12)
        message = "%s" % (self.planet.name)
        colour = team_colour(self.planet.owner)
        if self.planet.armies > 4:
            colour = brighten(colour)
        text = font.render(message, 1, colour)
        rect = text.get_rect(centerx=46, bottom=74)
        tag.blit(text, rect)
        self.mi_add_image(tag)

    def pick(self):
        self.mi_begin()

        self.add_icon()

        # render planet armies
        if self.planet.info & me.team:
            self.add_armies()
            self.add_flags()

        # render planet name
        self.add_name()

        self.mi_commit()

    def update(self):
        # check for change to planet to force a redraw
        new = self.planet.owner, self.planet.info, self.planet.name, self.planet.flags, self.planet.armies, self.planet.x, self.planet.y
        if new != self.old:
            self.old = new
            self.pick()
            self.rect.center = n2gs(self.planet.x, self.planet.y)

class PlanetTacticalSprite(PlanetSprite):
    """ netrek planet sprite on tactical """
    def __init__(self, planet):
        PlanetSprite.__init__(self, planet)
        self.pick()
        self.pos = 0, 0

    def show(self):
        t_planets.add(self)

    def hide(self):
        t_planets.remove(self)

    def pick(self):
        self.mi_begin()

        # IMAGERY: planet-???.png

        if self.planet.flags & PLAGRI:
            image = ic.get("planet-" + teams[self.planet.owner] + "-agri.png")
        else:
            image = ic.get("planet-" + teams[self.planet.owner] + ".png")
        self.mi_add_image(image)

        # IMAGERY: planet-overlay-*.png
        if me.planet == self.planet and me.flags & PFPLLOCK:
            self.mi_add_image(ic.get('planet-overlay-lock.png'))
        if self.planet.armies > 4 and self.planet.owner != me.team:
            self.mi_add_image(ic.get('planet-overlay-attack.png'))
            # FIXME: show attack ring for unscanned planets as well?
        if self.planet.armies > 4:
            self.mi_add_image(ic.get('planet-overlay-army.png'))
        if self.planet.flags & PLREPAIR:
            self.mi_add_image(ic.get('planet-overlay-repair.png'))
        if self.planet.flags & PLFUEL:
            self.mi_add_image(ic.get('planet-overlay-fuel.png'))

        # planet name
        image = pygame.Surface((120, 120), pygame.SRCALPHA, 32)
        font = fc.get(FONT_SANS, 17)
        message = "%s" % (self.planet.name)
        text = font.render(message, 1, team_colour(self.planet.owner))
        rect = text.get_rect(centerx=60, bottom=120)
        # FIXME: name may not fit within surface
        image.blit(text, rect)
        self.mi_add_image(image)

        self.mi_commit()

    def update(self):
        # check for change to planet to force a sprite image recreation
        reposition = False
        new = self.planet.owner, self.planet.info, self.planet.name, self.planet.flags, self.planet.armies, (self.planet == me.planet and me.flags & PFPLLOCK)
        if new != self.old:
            self.old = new
            self.pick()
            reposition = True
        # check for change to positions to force a sprite move
        new = me.x, me.y, self.planet.x, self.planet.y
        if new != self.pos:
            self.pos = new
            reposition = True
        if reposition:
            self.rect.center = n2ts(me, self.planet.x, self.planet.y)

class ShipSprite(MultipleImageSprite):
    def __init__(self, ship):
        self.ship = ship
        self.old = None
        MultipleImageSprite.__init__(self)

class ShipGalacticSprite(ShipSprite):
    """ netrek ship sprites
    """
    # FIXME: a non-moving ship does not appear
    def __init__(self, ship):
        ShipSprite.__init__(self, ship)
        self.pick()

    def update(self):
        new = self.ship.dir, self.ship.team, self.ship.shiptype, self.ship.status, self.ship.flags
        if new != self.old:
            self.old = new
            self.pick()
        self.rect.center = n2gs(self.ship.x, self.ship.y)

    def pick(self):
        self.mi_begin()
        size = 22
        message = slot_decode(self.ship.n)
        colour = team_colour(self.ship.team)
        if self.ship.flags & (PFPRACTR | PFROBOT | PFBPROBOT):
            size = 16
        if self.ship.flags & (PFCLOAK):
            message = '?'
        if self.ship.status == PEXPLODE:
            message = '*'
        if self.ship.kills > 199:
            colour = brighten(colour)
        pos = 36
        ring = pygame.Surface((pos, pos), pygame.SRCALPHA, 32)
        rgba = list(colour)
        rgba.append(128)
        pygame.draw.ellipse(ring, rgba, pygame.Rect((0, 6), (pos, 24)), 2)
        pygame.draw.ellipse(ring, rgba, pygame.Rect((6, 0), (24, pos)), 2)
        self.mi_add_image(ring)
        font = fc.get(FONT_SANS, size)
        self.image = font.render(message, 1, colour)
        self.rect = self.image.get_rect()
        self.mi_add_image(self.image)
        self.mi_commit()

    def show(self):
        g_players.add(self)

    def hide(self):
        g_players.remove(self)

class ShipTacticalSprite(ShipSprite):
    """ netrek ship sprites
    """
    def __init__(self, ship):
        ShipSprite.__init__(self, ship)
        self.tag = self.old_tag = None
        self.name = self.old_name = None
        self.pick()
        self.explosions = [ 'exp-10.png', 'exp-09.png', 'exp-08.png',
            'exp-07.png', 'exp-06.png', 'exp-05.png', 'exp-04.png',
            'exp-03.png', 'exp-02.png', 'exp-01.png', 'exp-00.png' ]

    def update(self):
        new = self.ship.dir, self.ship.team, self.ship.shiptype, self.ship.status, self.ship.flags, self.ship.fuse
        if new != self.old:
            self.old = new
            self.pick()
        self.rect.center = n2ts(me, self.ship.x, self.ship.y)

    def add_explosion(self):
        # IMAGERY: exp-??.png
        # FIXME: works fine at 10ups, looks wrong at 25ups.
        x = max(self.ship.fuse, 0)
        try:
            self.mi_add_image(ic.get(self.explosions[x]))
        except:
            self.mi_add_image(ic.get('explosion.png'))

    def add_ship(self):
        # IMAGERY: ???-??-40x40.png
        if self.ship.shiptype != STARBASE:
            rotation = self.ship.dir
        else:
            rotation = 0
        try:
            self.mi_add_image(ic.get_rotated(teams[self.ship.team]+'-'+ships[self.ship.shiptype]+"-40x40.png", rotation / 10 * 10))
        except:
            self.mi_add_image(ic.get_rotated('netrek.png', rotation / 16 * 16))

    def add_tag(self):
        new = self.ship.team, self.ship.flags & (PFPRACTR | PFROBOT | PFBPROBOT)
        if new != self.old_tag:
            self.old_tag = new
            pos = 76
            self.tag = pygame.Surface((pos, pos), pygame.SRCALPHA, 32)
            font = fc.get(FONT_SANS, 20)
            message = slot_decode(self.ship.n)
            colour = team_colour(self.ship.team)
            if self.ship.flags & (PFPRACTR | PFROBOT | PFBPROBOT):
                colour = (255, 0, 255)
            text = font.render(message, 1, colour)
            rect = text.get_rect(top=0, right=pos)
            self.tag.blit(text, rect)
        self.mi_add_image(self.tag)

    def add_name(self):
        new = self.ship.team, self.ship.flags & (PFPRACTR | PFROBOT | PFBPROBOT)
        if new != self.old_name:
            self.old_old_name = new
            pos = 80
            self.name = pygame.Surface((pos, pos), pygame.SRCALPHA, 32)
            font = fc.get(FONT_SANS, 16)
            message = self.ship.name.lower()
            colour = team_colour(self.ship.team)
            if self.ship.flags & (PFPRACTR | PFROBOT | PFBPROBOT):
                colour = (255, 0, 255)
            text = font.render(message, 1, colour)
            rect = text.get_rect(bottom=pos, centerx=pos/2)
            self.name.blit(text, rect)
        self.mi_add_image(self.name)

    def pick(self):
        self.mi_begin()
        status = self.ship.status
        flags = self.ship.flags
        if status == PEXPLODE:
            self.add_explosion()
        else:
            self.add_ship()
            if not flags & PFCLOAK:
                self.add_tag()
                if opt.ubertweak:
                    self.add_name()

        if status == PALIVE:
            if flags & PFCLOAK:
                # IMAGERY: ship-cloak.png
                self.mi_add_image(ic.get('ship-cloak.png'))
            if flags & PFSHIELD and (self.ship == me or not flags & PFCLOAK):
                # IMAGERY: shield-80x80.png
                self.mi_add_image(ic.get('shield-80x80.png'))

        self.mi_commit()

    def show(self):
        if not self.ship.flags & PFOBSERV:
            t_players.add(self)

    def hide(self):
        if not self.ship.flags & PFOBSERV:
            t_players.remove(self)

class TorpSprite(pygame.sprite.Sprite):
    def __init__(self, torp):
        self.torp = torp
        self.old_status = torp.status
        pygame.sprite.Sprite.__init__(self)

class TorpTacticalSprite(TorpSprite):
    """ netrek torp sprites
    """
    def __init__(self, torp):
        TorpSprite.__init__(self, torp)
        self.teams = { IND: 'torp-ind.png', FED: 'torp-fed.png', ROM: 'torp-rom.png', KLI: 'torp-kli.png', ORI: 'torp-ori.png' }
        self.types = { TFREE: 'netrek.png',
                       TEXPLODE: 'torp-explode-200.png',
                       TDET: 'torp-det.png',
                       TOFF: 'torp-off.png',
                       TSTRAIGHT: 'torp-straight.png' }
        self.pick()

    def update(self):
        # image changes only while exploding or change of status
        if self.torp.status == TEXPLODE:
            self.old_status = self.torp.status
            self.pick()
        else:
            if self.torp.status != self.old_status:
                self.old_status = self.torp.status
                self.pick()
        self.rect.center = n2ts(me, self.torp.x, self.torp.y)

    def pick(self):
        if self.torp.status == TMOVE:
            if self.torp.ship == me:
                # IMAGERY: torp-me.png
                self.image = ic.get('torp-me.png')
            else:
                # IMAGERY: torp-???.png
                self.image = ic.get(self.teams[self.torp.ship.team])
        elif self.torp.status == TEXPLODE:
            # IMAGERY: torp-explode.png
            # IMAGERY: torp-explode-*.png
            exp = ['torp-explode-20.png', 'torp-explode-40.png', 'torp-explode-60.png', 'torp-explode-80.png', 'torp-explode-100.png', 'torp-explode-120.png', 'torp-explode-140.png', 'torp-explode-160.png', 'torp-explode-180.png', 'torp-explode-200.png']
            try:
                self.image = ic.get(exp[self.torp.fuse])
            except:
                self.image = ic.get('torp-explode.png')
        else:
            self.image = ic.get('netrek.png')

        self.rect = self.image.get_rect()

    def show(self):
        t_torps.add(self)

    def hide(self):
        t_torps.remove(self)

class PlasmaSprite(pygame.sprite.Sprite):
    def __init__(self, plasma):
        self.plasma = plasma
        self.old_status = plasma.status
        pygame.sprite.Sprite.__init__(self)

class PlasmaTacticalSprite(PlasmaSprite):
    """ netrek plasma sprites
    """
    def __init__(self, plasma):
        PlasmaSprite.__init__(self, plasma)
        self.pick()

    def update(self):
        if self.plasma.status != self.old_status:
            self.old_status = self.plasma.status
            self.pick()
        self.rect.center = n2ts(me, self.plasma.x, self.plasma.y)

    def pick(self):
        if self.plasma.status == PTMOVE:
            self.image = ic.get('plasma-move.png')
            self.rect = self.image.get_rect()
        elif self.plasma.status == TEXPLODE:
            self.image = ic.get('plasma-explode.png')
            self.rect = self.image.get_rect()
        else:
            self.image = None
            self.rect = None

    def show(self):
        t_plasma.add(self)

    def hide(self):
        t_plasma.remove(self)

class Halos:
    def __init__(self):
        self.arcs = []
        self.rect = []

    def arc(self, surface, colour, xy, r, w):
        self.arcs.append((xy, r, w))
        return pygame.draw.circle(surface, colour, xy, r, w)

    def draw_planets(self, surface, threshold):
        # temporary highlight of my planets
        for n, planet in galaxy.planets.iteritems():
            if planet.owner != me.team: continue
            # colour depends on team
            colour = (0, 64, 0)
            # do not draw if off galactic
            if planet.x < 0: continue
            if planet.y < 0: continue
            # do not draw if on tactical
            offset_x = abs(planet.x - me.x)
            offset_y = abs(planet.y - me.y)
            if offset_x < 10000 and offset_x < 10000: continue
            # calculate distance to object
            distance = int ( ( offset_x ** 2 + offset_y ** 2 ) ** 0.5 )
            # radius is to be distance less tactical edge
            radius = distance - threshold
            if radius < 100: continue
            # scale radius down to graphics
            radius = radius / 20
            # thickness relates to kills
            cx, cy = n2ts(me, planet.x, planet.y)
            width = 1
            #if planet.armies > 4: width += 1
            #if planet.armies > 6: width += 1
            #if planet.armies > 10: width += 1
            self.rect.append(self.arc(surface, colour, (cx, cy), radius,
                                      width))

    def draw_ships(self, surface, threshold):
        # highlight of ships in game
        for n, ship in galaxy.ships.iteritems():
            if ship.status != PALIVE: continue
            if ship == me: continue
            # colour depends on team
            colour = (64, 0, 0)
            if ship.team == me.team: colour = (0, 64, 0)
            # do not draw if off galactic
            if ship.x < 0: continue
            if ship.y < 0: continue
            # do not draw if on tactical
            offset_x = abs(ship.x - me.x)
            offset_y = abs(ship.y - me.y)
            if offset_x < 10000 and offset_x < 10000: continue
            # calculate distance to object
            distance = int ( ( offset_x ** 2 + offset_y ** 2 ) ** 0.5 )
            # radius is to be distance less tactical edge
            radius = distance - threshold
            if radius < 100: continue
            # scale radius down to graphics
            radius = radius / 20
            cx, cy = n2ts(me, ship.x, ship.y)
            width = 1
            # thickness relates to kills
            #width = min(max(int(ship.kills),1),3)
            self.rect.append(self.arc(surface, colour, (cx, cy), radius,
                                      width))

    def draw_lock(self, surface, threshold):
        # if not locked, return
        if not me.flags & PFPLLOCK:
            return
        planet = me.planet
        colour = (0, 0, 64)
        offset_x = abs(planet.x - me.x)
        offset_y = abs(planet.y - me.y)
        distance = int ( ( offset_x ** 2 + offset_y ** 2 ) ** 0.5 )
        # radius is to be distance less tactical edge
        radius = distance - threshold
        if radius < 100: return
        # scale radius down to graphics
        radius = radius / 20
        cx, cy = n2ts(me, planet.x, planet.y)
        width = 4
        self.rect.append(self.arc(surface, colour, (cx, cy), radius,
                                  width))

    def draw(self, surface):
        if not opt.halos:
            return []

        self.arcs = []
        self.rect = []

        # do not draw if *we* are off galactic
        if me.x < 0 or me.y < 0: return self.rect

        # how close to edge to draw arcs, in galactic distance from me
        threshold = 9700

        #self.draw_planets(surface, threshold)
        self.draw_ships(surface, threshold)
        self.draw_lock(surface, threshold)

        return self.rect

    def undraw(self, surface, colour):
        if not opt.halos:
            return []
        for (xy, r, w) in self.arcs:
            pygame.draw.circle(surface, colour, xy, r, w)
        return self.rect

class Lines:
    def __init__(self):
        self.lines = []
        self.rect = []

    def line(self, sx, sy, ex, ey):
        self.lines.append((sx, sy, ex, ey))
        return pygame.draw.line(screen, (255, 0, 0), (sx, sy), (ex, ey))

    def draw(self):
        self.lines = []
        self.rect = []

class Borders(Lines):
    """ netrek borders
    """
    def __init__(self):
        Lines.__init__(self)
        # a netrek coordinate rectangle of the positions in the
        # galactic that do not need the borders drawn
        n = GWIDTH / 10
        self.inner = pygame.Rect((n, n), (GWIDTH-n-n, GWIDTH-n-n))

    def limit(self, v1, v2, vmin, vmax):
        return (max(vmin, v1), min(vmax-1, v2))

    def draw(self):
        self.lines = []
        self.rect = []

        # do not draw if the player is in the inner rectangle of the
        # galactic away from the edges
        if self.inner.collidepoint(me.x, me.y): return self.rect
        # screen coordinates of the top left corner of the galaxy
        x1, y1 = n2ts(me, 0, 0)
        # screen coordinates of the bottom right corner of the galaxy
        x2, y2 = n2ts(me, GWIDTH, GWIDTH)
        # is the top left corner X coordinate within the screen,
        # if so then draw the left edge, and so forth.
        if r_us.left < x1 < r_us.right:
            (sy, ey) = self.limit(y1, y2, r_us.top, r_us.bottom)
            self.rect.append(self.line(x1, sy, x1, ey))
        if r_us.top < y1 < r_us.bottom: # top edge
            (sx, ex) = self.limit(x1, x2, r_us.left, r_us.right)
            self.rect.append(self.line(sx, y1, ex, y1))
        if r_us.left < x2 < r_us.right: # right edge
            (sy, ey) = self.limit(y1, y2, r_us.top, r_us.bottom)
            self.rect.append(self.line(x2, sy, x2, ey))
        if r_us.top < y2 < r_us.bottom: # bottom edge
            (sx, ex) = self.limit(x1, x2, r_us.left, r_us.right)
            self.rect.append(self.line(sx, y2, ex, y2))
        return self.rect

    def undraw(self, colour):
        for (sx, sy, ex, ey) in self.lines:
            pygame.draw.line(screen, colour, (sx, sy), (ex, ey))
        return self.rect

    def draw_debug_planet_proximity_boxes(self):
        for n, planet in galaxy.planets.iteritems():
            (x1, y1, w, h) = planet.box
            x2 = x1 + w
            y2 = y1 + h
            x1, y1 = n2ts(me, x1, y1)
            x2, y2 = n2ts(me, x2, y2)
            self.rect.append(self.line(x1, y1, x2, y2))
            self.rect.append(self.line(x1, y2, x1, y2))

class LocatorSprite(pygame.sprite.Sprite):
    """ box describing tactical drawn on galactic
    """
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.pick()

    def update(self):
        self.pick()
        self.rect.center = n2gs(me.x, me.y)

    def pick(self):
        self.image = ic.get('locator.png')
        self.rect = self.image.get_rect()

class Alerts:
    """ red, yellow, and green alert status
    """
    def __init__(self):
        self.reset()

    def reset(self):
        self.lines = []
        self.rect = []

    def line(self, sx, sy, ex, ey):
        self.lines.append((sx, sy, ex, ey))
        self.rect.append(pygame.draw.line(screen, self.colour, (sx, sy), (ex, ey)))

    def draw_lines(self, l, t, r, b):
        self.line(l, t, r, t)
        self.line(r, t, r, b)
        self.line(r, b, l, b)
        self.line(l, b, l, t)

    def pick_colour(self):
        self.colour = (0, 255, 0)
        if me.flags & PFYELLOW:
            self.colour = (255, 255, 0)
        elif me.flags & PFRED:
            self.colour = (255, 0, 0)

    def undraw(self, colour):
        for (sx, sy, ex, ey) in self.lines:
            pygame.draw.line(screen, colour, (sx, sy), (ex, ey))
        return self.rect

class TacticalAlerts(Alerts):
    def __init__(self):
        Alerts.__init__(self)

    def draw(self):
        self.reset()
        self.pick_colour()
        self.draw_lines(r_us.left, r_us.top, r_us.right-1, r_us.bottom-1)
        return self.rect

class GalacticAlerts(Alerts):
    def __init__(self):
        Alerts.__init__(self)

    def draw(self):
        self.reset()
        self.pick_colour()
        l, t = n2gs(0, 0)
        r, b = n2gs(GWIDTH-1, GWIDTH-1)
        self.draw_lines(l, t, r, b)
        # FIXME: bottom line not visible if main height = 600, why?
        return self.rect

class Subgalactic(Alerts):
    def __init__(self):
        Alerts.__init__(self)

    def draw(self):
        self.reset()
        def draw_box(x, y, s):
            self.draw_lines(x-s, y+s, x+s, y+s)
            self.draw_lines(x+s, y+s, x+s, y-s)
            self.draw_lines(x+s, y-s, x-s, y-s)
            self.draw_lines(x-s, y-s, x-s, y+s)
        # tactical border
        self.colour = (64, 64, 64)
        x, y = n2ss(me.x, me.y)
        draw_box(x, y, 20)
        # galactic border
        self.colour = (92, 92, 92)
        self.draw_lines(r_sg.left, r_sg.top, r_sg.right-1, r_sg.bottom-1)
        # planets
        for n, planet in galaxy.planets.iteritems():
            x, y = n2ss(planet.x, planet.y)
            self.colour = team_colour(planet.owner)
            draw_box(x, y, 3)
        # ships
        for n, ship in galaxy.ships.iteritems():
            if ship.status != PALIVE: continue
            if not ship.x or not ship.y:
                continue
            x, y = n2ss(ship.x, ship.y)
            self.colour = (255, 255, 255)
            if ship != me:
                self.colour = brighten(team_colour(ship.team))
            draw_box(x, y, 1)
        return self.rect

class DebugSprite(pygame.sprite.Sprite):
    """ debug display values
    """
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.font = fc.get(FONT_SANS_MONO, 20)
        self.maxrps = 0
        self.minrps = 1000
        self.rps = []
        self.nrps = 10
        self.frames = 0
        self.last = self.now = time.time()
        self.pick()

    def update(self):
        self.pick()

    def pick(self):
        self.now = nt.time
        x = ' '
##         x += 'now %f ' % self.now
        x += 'ups %d ' % galaxy.ups

##         x += 'frames %d ' % ( galaxy.frames )
        fps = ( galaxy.frames - self.frames ) / ( self.now - self.last )
        x += 'fps %.1f ' % ( fps )
        self.frames = galaxy.frames
        self.last = self.now

        x += 'events %d ' % ( galaxy.events )

        rps = galaxy.rps
        self.rps.append(rps)
        if len(self.rps) > self.nrps:
            del self.rps[0]
        # redraws per second we could be capable of if there is demand
        x += 'rps %d ' % rps
##         if rps < self.minrps:
##             self.minrps = rps
##         x += 'min %d ' % self.minrps
##         if rps > self.maxrps:
##             self.maxrps = rps
##         x += 'max %d ' % self.maxrps
        s = 0
        for e in self.rps:
            s += e
        avg = ( s / len(self.rps) )
        x += 'avg %d ' % avg
        if galaxy.rps < fps:
            x += ' DISPLAY LAG'
        print x

        self.text = x
        self.image = self.font.render(self.text, 1, (255, 255, 255))
        self.rect = self.image.get_rect(centerx=(r_us.centerx),
                                        bottom=(r_us.bottom-50))

class ReportSprite(pygame.sprite.Sprite):
    """ netrek reports
        FIXME: graphical display instead of text
    """
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.font = fc.get(FONT_SANS_MONO, 20)
        self.fuel = self.damage = self.shield = self.armies = 0
        self.image = self.font.render('--', 1, (255, 255, 255))
        self.rect = self.image.get_rect(centerx=(r_us.centerx),
                                        bottom=(r_us.bottom-2))

    def update(self):
        if me.sp_you_shown and \
           me.sp_player_me_speed_shown and \
           me.sp_kills_me_shown and \
           me.repair_time_shown and \
           galaxy.sp_generic_32_shown: return
        self.pick()
        me.sp_you_shown = True
        me.sp_player_me_speed_shown = True
        me.sp_kills_me_shown = True
        me.repair_time_shown = True
        galaxy.sp_generic_32_shown = True

    def flags(self):
        r = ''
        f = me.flags
        if f & PFPRESS: f ^= PFTRACT
        f ^= PFSEEN
        x = ['SHIELDS',      'REPAIRING',     'BOMBING',       'ORBITING',
             'CLOAKED',      'WEAPONS-HOT',   'ENGINES-HOT',   'ROBOT',
             'BEAM-UP',      'BEAM-DOWN',     'SELF-DESTRUCT', None,
             'YELLOW-ALERT', 'RED-ALERT',     'SHIP-LOCK',     'PLANET-LOCK',
             'COPILOT',      'DECLARING-WAR', 'PRACTICE',      'DOCKED',
             'REFIT',        'REFITTING',     'TRACTOR',       'PRESSOR',
             'DOCKING-OK',   'UNSEEN',        'CYBORG',        'OBSERVING',
             None,           'OBSERVE',       'TRANSWARP',     'BPROBOT']
        for n in range(32):
            if f & (1 << n):
                if x[n]:
                    r += x[n] + ' '
        f = galaxy.gameup ^ GU_UNSAFE
        # turn off pre-t if pre-t-bots is on, as it is superfluous
        if f & GU_BOT_IN_GAME: f ^= GU_PRET
        # turn off chaos if practice is on, as it is superfluous
        if f & GU_PRACTICE: f ^= GU_CHAOS
        # turn off pause if parade is on, as it is superfluous
        if f & GU_CONQUER: f ^= GU_PAUSED
        x = ['safe-idle', # ^GU_UNSAFE
             'practice', # GU_PRACTICE
             # also set by INL robot during a pause, in pre-game, or post-game
             'chaos', # GU_CHAOS
             # also set by INL robot in post-game
             'paused', # GU_PAUSED
             'league', # GU_INROBOT
             'newbie', # GU_NEWBIE
             'pre-t', # GU_PRET
             'pre-t-bots', # GU_BOT_IN_GAME
             'conquer-parade', # GU_CONQUER
             'puck', # GU_PUCK
             'dog', # GU_DOG
             'drafting', # GU_INL_DRAFTING
             'drafted', # GU_INL_DRAFTED
             ]
        for n in range(32):
            if f & (1 << n):
                if x[n]:
                    r += '(' + x[n] + ') '
        return r

    def pick(self):
        x = ' '
        if me.armies > 0:                  x += "A %d " % me.armies
        if me.kills  > 0:                  x += "K %.2f " % (me.kills / 100.0)
        if me.shiptype != STARBASE:
            if me.speed > 0:               x += "S %d " % me.speed
        else:
            if me.speed != me.cap.s_maxspeed: x += "S %d " % me.speed
        if me.fuel   < me.cap.s_maxfuel:   x += "F %d " % me.fuel
        if me.damage > 0:                  x += "D %d " % me.damage
        if me.shield < me.cap.s_maxshield: x += "S %d " % me.shield
        if me.etemp  > 0:                  x += "E %d " % (me.etemp / 10)
        if me.wtemp  > 0:                  x += "W %d " % (me.wtemp / 10)
        x += self.flags()
        if me.flags & PFREPAIR:
            x += '[%d] ' % me.repair_time
        if galaxy.tournament_remain != 0:
            x += '{%d%s} ' % (galaxy.tournament_remain, galaxy.tournament_remain_units)
        self.text = x
        self.image = self.font.render(self.text, 1, (255, 255, 255))
        self.rect = self.image.get_rect(centerx=(r_us.centerx),
                                        bottom=(r_us.bottom-2))

class WarningSprite(pygame.sprite.Sprite):
    """ netrek warnings
    """
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.font = fc.get(FONT_SANS, 24)
        self.last = ''
        self.time = 0
        self.pick('')

    def update(self):
        if sp_warning.seen: return
        sp_warning.seen = True
        text = sp_warning.text
        if self.last != text:
            self.last = text
            self.pick(text)
            self.time = 1000
            length = len(text)
            if length > 32: self.time = 2500
            if length > 64: self.time = 5000
        pygame.time.set_timer(pygame.USEREVENT+2, self.time)

    def ue(self, event):
        pygame.time.set_timer(pygame.USEREVENT+2, 0)
        self.pick('')

    def pick(self, text):
        self.image = self.font.render(text, 1, (255, 0, 0))
        self.rect = self.image.get_rect(centerx=r_us.centerx, top=r_us.top+2)

class MessageLine():
    def __init__(self, m_flags, m_recipt, m_from, mesg):
        self.text = mesg
        self.colour = (128, 128, 128)
        if m_from != 0xff:
            self.colour = team_colour(galaxy.ship(m_from).team)
        self.expires = nt.time + 15
        self.expired = False

class InfoSprite(pygame.sprite.Sprite):
    """ info window,
        user requested information on screen objects
        including help
    """
    def __init__(self, lines, track=None, expires=7):
        pygame.sprite.Sprite.__init__(self)
        self.font = fc.get(FONT_SANS_CONDENSED, 18)
        #self.icon = ic.get(icon)
        #self.close_icon = ic.get('close.png')
        self.lines = lines
        self.pad = 20
        self.border = 2
        self.track = track
        self.expires = nt.time + expires
        self.expired = False
        self.pick()
        self.update()
        self.add(b_info)

    def update(self):
        if nt.time > self.expires:
            self.kill()
            return

        if self.track:
            if ph_flight == ph_tactical:
                self.rect.center = n2ts(me, self.track.x, self.track.y)
            else:
                self.rect.center = n2gs(self.track.x, self.track.y)
        else:
            self.rect.center = (r_us.centerx, r_us.centery)

    def pick(self):
        x = self.border + self.pad # + self.icon.get_rect().width
        y = self.border + self.pad

        # build lines of text as surfaces
        surfaces = []
        longest = 0
        for line in self.lines:
            surface = self.font.render(line, 1, (250, 250, 250))
            surfaces.append(surface)
            rect = surface.get_rect()
            y = y + rect.height + 1
            longest = max(longest, rect.width)
        x += longest

        # calculate expected image size
        #x += self.pad
        #x += self.close_icon.get_rect().width
        x += self.pad + self.border
        y += self.pad + self.border

        # create image, with a 50% alpha background
        self.image = pygame.Surface((x, y), pygame.SRCALPHA, 32)
        self.image.fill((48, 24, 48, 128))

        # draw into the image
        x = self.border + self.pad
        y = self.border + self.pad

        # place the icon at top left
        #rect = self.icon.get_rect(left=x, top=y)
        #self.image.blit(self.icon, rect)
        #x += rect.width + self.pad

        # place supplied text to the right of icon
        w = x
        for surface in surfaces:
            rect = surface.get_rect(left=x, top=y)
            self.image.blit(surface, rect)
            y = y + rect.height + 1
            if rect.right > w: w = rect.right
        x = w

        # place an icon at bottom right
        #x += self.pad
        #rect = self.close_icon.get_rect(left=x, bottom=y)
        #self.image.blit(self.close_icon, rect)
        #x += rect.width

        # pad
        x += self.pad + self.border
        y += self.pad + self.border

        # surround the written image area with a purple border
        rect = pygame.Rect(0, 0, x - self.border, y - self.border)
        pygame.draw.rect(self.image, (255, 128, 255), rect, self.border)

        self.rect = self.image.get_rect(centerx=r_us.centerx,
                                        centery=r_us.centery)

class MessageSprite(pygame.sprite.Sprite):
    """ message window,
        for incoming and outgoing social and tactical human messaging.
    """
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        galaxy.message = self
        self.width = 900
        self.height = 400
        size = 16
        if r_main.width < 801:
            size = 14
            self.width = 750
        self.font = fc.get(FONT_SANS_MONO, size)
        self.maximum = 10
        self.dirty = True
        self.lines = []
        self.head = ''
        intro = ['Welcome to Netrek', \
                 ' ', \
                 'You are now in your ship', \
                 'Press a number to start moving', \
                 'Use right mouse button to steer', \
                 'Use left mouse button to fire torpedoes', \
                 'Press m to send a message', \
                 ' ']
        for line in intro:
            self.append(0, 0, 0xff, line)
        self.pick()

    def append(self, m_flags, m_recipt, m_from, mesg):
        """ add a received message to the display """
        # FIXME: show only team and individual messages by default
        # messages to ALL are not generally useful.
        self.lines.append(MessageLine(m_flags, m_recipt, m_from, mesg))
        if len(self.lines) > self.maximum:
            del self.lines[0]
        self.dirty = True

    def update(self):
        # remove lines that have expired
        for line in self.lines:
            if not line.expired:
                if line.expires < nt.time:
                    line.expired = True
                    self.dirty = True
        # avoid rendering if lines unchanged
        if self.dirty:
            self.pick()
            self.dirty = False

    def pick(self):
        # make an image to hold the whole widget
        self.image = pygame.Surface((self.width, self.height),
                                    pygame.SRCALPHA, 32)

        # build a list of surfaces containing the rendered lines
        surfaces = []
        for line in self.lines:
            text = line.text
            if line.expired and self.head == '':
                text = ''
            colour = line.colour
            if self.head != '':
                colour = brighten(colour)
            ts = self.font.render(text, 1, colour)
            surfaces.append(ts)

        # lay out the smaller images on the master image
        y = 0
        for surface in surfaces:
            rect = surface.get_rect(left=0, top=y)
            self.image.blit(surface, rect)
            y = y + rect.height + 1

        y = y + 10
        # if typing is underway
        if self.head != '':
            box_top = y - 1
            # display the outgoing message buffer
            line = self.head + '->' + self.tail + '  ' + self.text
            surface = self.font.render(line, 1, (255, 255, 255))
            rect = surface.get_rect(left=0, top=y)
            self.image.blit(surface, rect)
            y = y + rect.height + 1
            # display instructions
            (line, colour) = self.hint()
            surface = self.font.render(line, 1, colour)
            rect = surface.get_rect(left=0, top=y)
            self.image.blit(surface, rect)
            y = y + rect.height + 1
            # draw a blue box around typing area
            rect = pygame.Rect(0, box_top, self.width, (y - box_top))
            pygame.draw.rect(self.image, (128, 128, 255), rect, 1)

        self.rect = self.image.get_rect(centerx=r_us.centerx, top=r_us.top+100)
        # FIXME: darken on red alert
        # FIXME: flexible user chosen position
        # FIXME: place in quadrant away from action depending on team

        # FIXME: list players on a southern surface during message entry

    def start(self):
        """ start an outgoing message """
        self.dirty = True
        self.group = 0
        self.indiv = 0
        self.head = ' ' + me.mapchars
        self.tail = ''
        self.text = ''

    def abort(self):
        """ abort an outgoing message """
        self.dirty = True
        self.head = ''

    def retarget(self):
        """ return to target selection for outgoing message """
        self.dirty = True
        self.tail = ''

    def target(self, event):
        """ process target selection for outgoing message, return true
        if a valid target was selected """
        self.dirty = True
        if (event.mod & KMOD_SHIFT):
            targs = { K_a: [MALL, 'ALL'], K_g: [MGOD, 'GOD'] }
            if event.key in targs:
                (self.group, self.tail) = targs[event.key]
                return True
            targs = { K_f: FED, K_r: ROM,
                      K_k: KLI, K_o: ORI }
            if event.key in targs:
                self.group = MTEAM
                self.indiv = targs[event.key]
                self.tail = teams[self.indiv].upper()
                return True
        if event.key == K_t or event.key == K_SPACE:
            self.group = MTEAM
            self.indiv = me.team
            self.tail = teams[self.indiv].upper()
            return True
        if event.key == K_EQUALS:
            self.group = MINDIV
            self.indiv = me.n
            self.tail = me.mapchars + ' '
            return True
        slot = slot_encode(event.unicode)
        if slot == -1:
            return False
        ship = galaxy.ship(slot)
        if ship == None:
            return False
        if ship.status == PFREE:
            return False
        self.group = MINDIV
        self.indiv = ship.n
        self.tail = ship.mapchars + ' '
        return True

    def typing(self, event):
        """ store characters as the message is typed """
        self.dirty = True
        self.text = self.text + event.unicode

    def backspace(self):
        self.dirty = True
        self.text = self.text[:-1]

    def is_empty(self):
        return len(self.text) == 0

    def send(self):
        """ send the composed message to the server and loopback """
        mesg = str(self.text)
        line = self.head + '->' + self.tail + '  ' + self.text
        self.head = self.tail = self.text = ''
        self.dirty = True
        nt.send(cp_message.data(self.group, self.indiv, mesg))
        # messages sent to god, teams other than our own, and to
        # other players, do not get sent back to us by the server,
        # so we loop them back to our own display.
        if ((self.group == MGOD) or
            (self.group == MTEAM and self.indiv != me.team) or
            (self.group == MINDIV and self.indiv != me.n)):
            galaxy.sp_message(0, 0, 0, line)
        return

    def hint(self):
        """ generate contextual hint to guide player during entry """
        colour = (255, 128, 128)
        if len(self.text) > (80 - 12):
            line = '          ' + ' ' * len(self.text) + '^ GO BACK'
            return (line, (255, 128, 128))
        if len(self.text) > (79 - 12):
            line = '          ' + ' ' * len(self.text) + '^ STOP'
            return (line, (255, 128, 128))
        if len(self.text) > 12:
            line = '          ' + ' ' * len(self.text) + '^ type'
            return (line, (128, 255, 128))
        if len(self.text) > 0:
            line = '          ' + ' ' * len(self.text) + '^ type, press enter to send, or escape to abort'
            return (line, (128, 255, 128))
        if self.tail != '':
            line = '          ' + ' ' * len(self.text) + '^ type, or backspace'
            return (line, (128, 255, 128))
        if self.head != '':
            line = '     ^ t for team, A for all, F, R, K, O, a ship number, or backspace to abort'
            return (line, (128, 128, 255))
        return ('bogus', (255, 255, 255))

""" netrek protocol documentation, from server include/packets.h

	general protocol state outline

	starting state

	CP_SOCKET
	CP_FEATURE, optional, to indicate feature packets are known
	SP_MOTD
	SP_FEATURE, only if CP_FEATURE was seen
	SP_QUEUE, optional, repeats until slot is available
	SP_YOU, indicates slot number assigned

	login state, player slot status is POUTFIT
	client shows name and password prompt and accepts input

	CP_LOGIN
	CP_FEATURE
	SP_LOGIN
	SP_YOU
	SP_PLAYER_INFO
	various other server packets

	outfit state, player slot status is POUTFIT
	client shows team selection window

	SP_MASK, sent regularly during outfit

	client accepts team selection input
	CP_OUTFIT
	SP_PICKOK, signals server acceptance of alive state

	alive state,
	server places ship in game and play begins

	SP_PSTATUS, indicates PDEAD state
	client animates explosion

	SP_PSTATUS, indicates POUTFIT state
	clients returns to team selection window

	CP_QUIT
	CP_BYE
"""

""" client originated packets
"""

cp_table = {}

class ClientPacket(type):
    def __new__(cls, name, bases, dct):
        client_packet = type.__new__(cls, name, bases, dct)

        if name.startswith('CP_'):
            cp_table[client_packet.code] = client_packet.format
            globals()[name.lower()] = client_packet()

        return client_packet

class CP:
    __metaclass__ = ClientPacket

    code = -1
    format = ''

    def data(self, *args):
        if opt.cp: print self.__class__.__name__, args
        return struct.pack(self.format, self.code, *args)

class CP_SOCKET(CP):
    code = 27
    format = '!bbbxI'

    def data(self):
        if opt.cp: print "CP_SOCKET"
        return struct.pack(self.format, self.code, 4, 10, 0)

class CP_BYE(CP):
    code = 29
    format = '!bxxx'

    def data(self):
        if opt.cp: print "CP_BYE"
        return struct.pack(self.format, self.code)

class CP_LOGIN(CP):
    code = 8
    format = '!bbxx16s16s16s'

    def data(self, query, name, password, login):
        if opt.cp: print "CP_LOGIN query=",query,"name=",name
        return struct.pack(self.format, self.code, query, name, password, login)

class CP_OUTFIT(CP):
    code = 9
    format = '!bbbx'

    def data(self, race, ship=ASSAULT):
        if opt.cp: print "CP_OUTFIT team=",race_decode(race),"ship=",ship
        return struct.pack(self.format, self.code, race, ship)

class CP_SPEED(CP):
    code = 2
    format = '!bbxx'

    def data(self, speed):
        if opt.cp: print "CP_SPEED speed=",speed
        return struct.pack(self.format, self.code, speed)

class CP_DIRECTION(CP):
    code = 3
    format = '!bBxx'

    def data(self, direction):
        if opt.cp: print "CP_DIRECTION direction=",direction
        return struct.pack(self.format, self.code, direction & 255)

class CP_PLANLOCK(CP):
    code = 15
    format = '!bbxx'

    def data(self, pnum):
        if opt.cp: print "CP_PLANLOCK pnum=",pnum
        return struct.pack(self.format, self.code, pnum)

class CP_PLAYLOCK(CP):
    code = 16
    format = '!bbxx'

    def data(self, pnum):
        if opt.cp: print "CP_PLAYLOCK pnum=",pnum
        return struct.pack(self.format, self.code, pnum)

class CP_UPDATES(CP):
    code = 31
    format = '!bxxxI'

    def data(self, usecs):
        if opt.cp: print "CP_UPDATES usecs=",usecs
        return struct.pack(self.format, self.code, usecs)

class CP_BOMB(CP):
    code = 17
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_BOMB state=",state
        return struct.pack(self.format, self.code, state)

class CP_BEAM(CP):
    code = 18
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_BEAM state=",state
        return struct.pack(self.format, self.code, state)

class CP_CLOAK(CP):
    code = 19
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_CLOAK state=",state
        return struct.pack(self.format, self.code, state)

class CP_REPAIR(CP):
    code = 13
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_REPAIR state=",state
        return struct.pack(self.format, self.code, state)

class CP_SHIELD(CP):
    code = 12
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_SHIELD state=",state
        return struct.pack(self.format, self.code, state)

class CP_MESSAGE(CP):
    code = 1
    format = "!bBBx80s"

    def data(self, group, indiv, mesg):
        if opt.cp: print "CP_MESSAGE group=",group,"indiv=",indiv,"mesg=",mesg
        return struct.pack(self.format, self.code, group, indiv, mesg)

class CP_PHASER(CP):
    code = 4
    format = '!bBxx'

    def data(self, direction):
        if opt.cp: print "CP_PHASER direction=",direction
        return struct.pack(self.format, self.code, direction & 255)

class CP_PLASMA(CP):
    code = 5
    format = '!bBxx'

    def data(self, direction):
        if opt.cp: print "CP_PLASMA direction=",direction
        return struct.pack(self.format, self.code, direction & 255)

class CP_TORP(CP):
    code = 6
    format = '!bBxx'

    def data(self, direction):
        if opt.cp: print "CP_TORP direction=",direction
        return struct.pack(self.format, self.code, direction & 255)

class CP_QUIT(CP):
    code = 7
    format = '!bxxx'

    def data(self):
        if opt.cp: print "CP_QUIT"
        return struct.pack(self.format, self.code)

class CP_WAR(CP):
    code = 10
    format = '!bbxx'

    def data(self, newmask):
        if opt.cp: print "CP_WAR newmask=",newmask
        return struct.pack(self.format, self.code, newmask)

class CP_PRACTR(CP):
    code = 11
    format = '!bxxx'

    def data(self):
        if opt.cp: print "CP_PRACTR"
        return struct.pack(self.format, self.code)

class CP_ORBIT(CP):
    code = 14
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_ORBIT =",state
        return struct.pack(self.format, self.code, state)

class CP_DET_TORPS(CP):
    code = 20
    format = '!bxxx'

    def data(self):
        if opt.cp: print "CP_DET_TORPS"
        return struct.pack(self.format, self.code)

class CP_DET_MYTORP(CP):
    code = 21
    format = '!bxh'

    def data(self, tnum):
        if opt.cp: print "CP_DET_MYTORP"
        return struct.pack(self.format, self.code, tnum)

class CP_COPILOT(CP):
    code = 22
    format = '!bbxx'

    def data(self, state=1):
        if opt.cp: print "CP_COPILOT"
        return struct.pack(self.format, self.code, state)

class CP_REFIT(CP):
    code = 23
    format = '!bbxx'

    def data(self, ship):
        if opt.cp: print "CP_REFIT ship=",ship
        return struct.pack(self.format, self.code, ship)

class CP_TRACTOR(CP):
    code = 24
    format = '!bbbx'

    def data(self, state, pnum):
        if opt.cp: print "CP_TRACTOR state=",state,"pnum=",pnum
        return struct.pack(self.format, self.code, state, pnum)

class CP_REPRESS(CP):
    code = 25
    format = '!bbbx'

    def data(self, state, pnum):
        if opt.cp: print "CP_REPRESS state=",state,"pnum=",pnum
        return struct.pack(self.format, self.code, state, pnum)

class CP_COUP(CP):
    code = 26
    format = '!bxxx'

    def data(self):
        if opt.cp: print "CP_COUP"
        return struct.pack(self.format, self.code)

class CP_OPTIONS(CP):
    code = 28
    format = "!bxxxI96s"

    def data(self, flags, keymap):
        if opt.cp: print "CP_OPTIONS flags=",flags,"keymap=",keymap
        return struct.pack(self.format, self.code, flags, keymap)

class CP_DOCKPERM(CP):
    code = 30
    format = '!bbxx'

    def data(self, state):
        if opt.cp: print "CP_DOCKPERM state=",state
        return struct.pack(self.format, self.code, state)

class CP_RESETSTATS(CP):
    code = 32
    format = '!bbxx'

    def data(self, verify):
        if opt.cp: print "CP_RESETSTATS verify=",verify
        return struct.pack(self.format, self.code, verify)

class CP_RESERVED(CP):
    code = 33
    format = "!bxxx16s16s"

    def data(self, data, resp):
        if opt.cp: print "CP_RESERVED"
        return struct.pack(self.format, self.code, data, resp)

class CP_SCAN(CP):
    code = 34
    format = '!bbxx'

    def data(self, pnum):
        if opt.cp: print "CP_SCAN pnum=",pnum
        return struct.pack(self.format, self.code, pnum)

class CP_UDP_REQ(CP):
    code = 35
    format = '!bbbxi'

    def data(self, request, connmode, port):
        if opt.cp: print "CP_UDP_REQ request=%d connmode=%d port=%d" % (request, connmode, port)
        return struct.pack(self.format, self.code, request, connmode, port)

class CP_FEATURE(CP):
    code = 60
    format = "!bcbbi80s"

    def data(self, type, arg1, arg2, value, name):
        if opt.cp: print "CP_FEATURE type=%s arg1=%d arg2=%d value=%d name=%s" % (type, arg1, arg2, value, name)
        return struct.pack(self.format, self.code, type, arg1, arg2, value, name)

class CP_PING_RESPONSE(CP):
    code = 42
    format = "!bBbxll"

    def data(self, number, pingme, cp_sent, cp_recv):
        if opt.cp: print "CP_PING_RESPONSE pingme=", pingme
        return struct.pack(self.format, self.code, number, pingme, cp_sent, cp_recv)
        # FIXME: bug #1215317195 reported by Zach, pinging the player
        # using "!" results in O0 PING stats: Avg: 364 ms, Stdv: 19
        # ms, Loss: ^@100.0%/nan% s->c/c->s


""" server originated packets
"""

sp_table = {}

class ServerPacket(type):
    def __new__(cls, name, bases, dct):
        server_packet = type.__new__(cls, name, bases, dct)

        if dct['code'] not in sp_table:
            obj = server_packet()
            sp_table[server_packet.code] = (
                struct.calcsize(server_packet.format), obj)
            if name.lower() not in globals():
                globals()[name.lower()] = obj

        return server_packet

class SP:
    __metaclass__ = ServerPacket
    code = -1
    format = ''

    def find(self, number):
        """ given a packet type return a tuple consisting of
            (size, instance), or (1, self) if type not known
        """
        if number not in sp_table:
            return (1, self)
        return sp_table[number]

    def handler(self, data):
        raise NotImplemented


class SP_MOTD(SP):
    code = 11
    format = '!bxxx80s'

    def handler(self, data):
        (ignored, message) = struct.unpack(self.format, data)
        message = strnul(message)
        if opt.sp: print "SP_MOTD message=", message
        galaxy.motd.add(message)

class SP_YOU(SP):
    code = 12
    format = '!bbbbbbxxIlllhhhh'

    def handler(self, data):
        global opt
        (ignored, pnum, hostile, swar, armies, tractor, flags, damage,
         shield, fuel, etemp, wtemp, whydead, whodead) = struct.unpack(self.format, data)
        if opt.sp: print "SP_YOU pnum=",pnum,"hostile=",team_decode(hostile),"swar=",team_decode(swar),"armies=",armies,"tractor=",tractor,"flags=",flags,"damage=",damage,"shield=",shield,"fuel=",fuel,"etemp=",etemp,"wtemp=",wtemp,"whydead=",whydead,"whodead=",whodead
        ship = galaxy.ship(pnum)
        ship.sp_you(hostile, swar, armies, flags, damage, shield, fuel, etemp, wtemp, whydead, whodead)
        trac = galaxy.tractor(pnum, ship)
        trac.sp_tractor(flags, tractor)
        if nt.mode == COMM_TCP and ship.speed == 0:
            galaxy.pace()
        if opt.name:
            nt.send(cp_updates.data(1000000/opt.updates))
            nt.send(cp_login.data(0, opt.name, opt.password, opt.login))
            opt.name = None

class SP_QUEUE(SP):
    code = 13
    format = '!bxh'

    def handler(self, data):
        (ignored, pos) = struct.unpack(self.format, data)
        if opt.sp: print "SP_QUEUE pos=",pos
        galaxy.sp_queue(pos);

class SP_PL_LOGIN(SP):
    code = 24
    format = "!bbbx16s16s16s"

    def handler(self, data):
        (ignored, pnum, rank, name, monitor,
         login) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PL_LOGIN pnum=",pnum,"rank=",rank,"name=",strnul(name),"monitor=",strnul(monitor),"login=",strnul(login)
        ship = galaxy.ship(pnum)
        ship.sp_pl_login(rank, name, monitor, login)

class SP_HOSTILE(SP):
    code = 22
    format = "!bbbb"

    def handler(self, data):
        (ignored, pnum, war, hostile) = struct.unpack(self.format, data)
        if opt.sp: print "SP_HOSTILE pnum=",pnum,"war=",team_decode(war),"hostile=",team_decode(hostile)
        ship = galaxy.ship(pnum)
        ship.sp_hostile(war, hostile)

class SP_PLAYER_INFO(SP):
    code = 2
    format = "!bbbb"

    def handler(self, data):
        (ignored, pnum, shiptype, team) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLAYER_INFO pnum=",pnum,"shiptype=",shiptype,"team=",team_decode(team)
        ship = galaxy.ship(pnum)
        ship.sp_player_info(shiptype, team)

class SP_KILLS(SP):
    code = 3
    format = "!bbxxI"

    def handler(self, data):
        (ignored, pnum, kills) = struct.unpack(self.format, data)
        if opt.sp: print "SP_KILLS pnum=",pnum,"kills=",kills
        ship = galaxy.ship(pnum)
        ship.sp_kills(kills)

class SP_PSTATUS(SP):
    code = 20
    format = "!bbbx"

    def handler(self, data):
        (ignored, pnum, status) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PSTATUS pnum=",pnum,"status=",status
        ship = galaxy.ship(pnum)
        ship.sp_pstatus(status)

class SP_PLAYER(SP):
    code = 4
    format = "!bbBbll"

    def handler(self, data):
        (ignored, pnum, dir, speed, x, y) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLAYER pnum=",pnum,"dir=",dir,"speed=",speed,"x=",x,"y=",y
        ship = galaxy.ship(pnum)
        ship.sp_player(dir, speed, x, y)
        if nt.mode == COMM_TCP and ship == me:
            galaxy.pace()

class SP_FLAGS(SP):
    code = 18
    format = "!bbbxI"

    def handler(self, data):
        (ignored, pnum, tractor, flags) = struct.unpack(self.format, data)
        if opt.sp: print "SP_FLAGS pnum=",pnum,"tractor=",tractor,"flags=",flags
        ship = galaxy.ship(pnum)
        ship.sp_flags(flags)
        trac = galaxy.tractor(pnum, ship)
        trac.sp_tractor(flags, tractor)

class SP_PLANET_LOC(SP):
    code = 26
    format = "!bbxxll16s"

    def handler(self, data):
        (ignored, pnum, x, y, name) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLANET_LOC pnum=",pnum,"x=",x,"y=",y,"name=",strnul(name)
        planet = galaxy.planet(pnum)
        planet.sp_planet_loc(x, y, name)

class SP_LOGIN(SP):
    code = 17
    format = "!bbxxl96s"
    callback = None

    def uncatch(self):
        self.callback = None

    def catch(self, callback):
        self.callback = callback

    def handler(self, data):
        (ignored, accept, flags, keymap) = struct.unpack(self.format, data)
        if opt.sp: print "SP_LOGIN accept=",accept,"flags=",flags
        if self.callback:
            self.callback(accept, flags, keymap)
            self.uncatch()
        if accept == 1:
            nt.send(cp_ping_response.data(0, 1, 0, 0))

class SP_MASK(SP):
    code = 19
    format = "!bbxx"
    callback = None

    def uncatch(self):
        self.callback = None

    def catch(self, callback):
        self.callback = callback

    def handler(self, data):
        (ignored, mask) = struct.unpack(self.format, data)
        if opt.sp: print "SP_MASK mask=",team_decode(mask)
        if self.callback:
            self.callback(mask)
        # FIXME: #1187683470 update team selection icons in response to SP_MASK

class SP_PICKOK(SP):
    code = 16
    format = "!bbxx"
    callback = None
    versioned = False

    def uncatch(self):
        self.callback = None

    def catch(self, callback):
        self.callback = callback

    def version(self):
        if self.versioned: return
        self.versioned = True
        nt.send(cp_message.data(MINDIV | MCONFIG, me.n, "@gytha %s" % VERSION))

    def handler(self, data):
        (ignored, state) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PICKOK state=", state
        if state == 1:
            self.version()
        nt.sp_pickok()
        if self.callback:
            self.callback(state)
            self.uncatch()

class SP_RESERVED(SP):
    code = 25
    format = "!bxxx16s"

    def handler(self, data):
        (ignored, data) = struct.unpack(self.format, data)
        text = struct.unpack('16b', data)
        if opt.sp: print "SP_RESERVED data=",text
        resp = data
        # FIXME: generate correct response data
        nt.send(cp_reserved.data(data, resp))

class SP_TORP_INFO(SP):
    code = 5
    format = "!bbbxhxx"

    def handler(self, data):
        (ignored, war, status, tnum) = struct.unpack(self.format, data)
        if opt.sp: print "SP_TORP_INFO war=%s status=%d tnum=%d" % (str(team_decode(war)), status, tnum)
        torp = galaxy.torp(tnum)
        torp.sp_torp_info(war, status)

class SP_TORP(SP):
    code = 6
    format = "!bBhll"

    def handler(self, data):
        (ignored, dir, tnum, x, y) = struct.unpack(self.format, data)
        if opt.sp: print "SP_TORP dir=%d tnum=%d x=%d y=%d" % (dir, tnum, x, y)
        torp = galaxy.torp(tnum)
        torp.sp_torp(dir, x, y)

class SP_PLASMA_INFO(SP):
    code = 8
    format = "!bbbxhxx"

    def handler(self, data):
        (ignored, war, status, pnum) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLASMA_INFO war=",team_decode(war),"status=",status,"pnum=",pnum
        plasma = galaxy.plasma(pnum)
        plasma.sp_plasma_info(war, status)

class SP_PLASMA(SP):
    code = 9
    format = "!bxhll"

    def handler(self, data):
        (ignored, pnum, x, y) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLASMA pnum=",pnum,"x=",x,"y=",y
        plasma = galaxy.plasma(pnum)
        plasma.sp_plasma(x, y)

class SP_STATUS(SP):
    code = 14
    format = "!bbxxIIIIIL"

    def handler(self, data):
        (ignored, tourn, armsbomb, planets, kills, losses, time, timeprod) = struct.unpack(self.format, data)
        if opt.sp: print "SP_STATUS tourn=",tourn,"armsbomb=",armsbomb,"planets=",planets,"kills=",kills,"losses=",losses,"time=",time,"timepro=",timeprod
        # FIXME: display t-mode state, and hey, the other things might be fun

class SP_PHASER(SP):
    code = 7
    format = "!bbbBlll"

    def handler(self, data):
        (ignored, pnum, status, dir, x, y, target) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PHASER pnum=",pnum,"status=",status,"dir=",dir,"x=",x,"y=",y,"target=",target
        phaser = galaxy.phaser(pnum)
        phaser.sp_phaser(status, dir, x, y, target)

class SP_PLANET(SP):
    code = 15
    format = "!bbbbhxxl"

    def handler(self, data):
        (ignored, pnum, owner, info, flags, armies) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PLANET pnum=",pnum,"owner=",owner,"info=",info,"flags=",flags,"armies=",armies
        planet = galaxy.planet(pnum)
        planet.sp_planet(owner, info, flags, armies)

class SP_MESSAGE(SP):
    code = 1
    format = "!bBBB80s"

    def handler(self, data):
        (ignored, m_flags, m_recpt, m_from, mesg) = struct.unpack(self.format, data)
        if opt.sp: print "SP_MESSAGE m_flags=",m_flags,"m_recpt=",m_recpt,"m_from=",m_from,"mesg=",strnul(mesg)
        galaxy.sp_message(m_flags, m_recpt, m_from, mesg)

class SP_STATS(SP):
    code = 23
    format = "!bbxx13l"

    def handler(self, data):
        (ignored, pnum, tkills, tlosses, kills, losses, tticks, tplanets, tarmies, sbkills, sblosses, armies, planets, maxkills, sbmaxkills) = struct.unpack(self.format, data)
        if opt.sp: print "SP_STATS pnum=",pnum,"tkills=",tkills,"tlosses=",tlosses,"kills=",kills,"losses=",losses,"tticks=",tticks,"tplanets=",tplanets,"tarmies=",tarmies,"sbkills=",sbkills,"sblosses=",sblosses,"armies=",armies,"planets=",planets,"maxkills=",maxkills,"sbmaxkills=",sbmaxkills

class SP_WARNING(SP):
    code = 10
    format = '!bxxx80s'
    text = ''
    seen = False

    def handler(self, data):
        (ignored, message) = struct.unpack(self.format, data)
        if opt.sp: print "SP_WARNING message=", strnul(message)
        self.text = strnul(message)
        self.seen = False

    def synthetic(self, text):
        self.text = text
        self.seen = False

class SP_FEATURE(SP):
    code = 60
    format = "!bcbbi80s"

    def handler(self, data):
        (ignored, type, arg1, arg2, value, name) = struct.unpack(self.format, data)
        name = strnul(name)
        if opt.sp:
            print "SP_FEATURE type=%s arg1=%d arg2=%d value=%d name=%s" % (type, arg1, arg2, value, name)
        if (type, arg1, arg2, value, name) == ('S', 0, 0, 1, 'FEATURE_PACKETS'):
            # server says features packets are okay to send,
            # so send this client's features
            if rcd.cp_feature: # we want binary RCDs in SP_MESSAGE packets
                nt.send(cp_feature.data('S', 0, 0, 1, 'RC_DISTRESS'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'SHIP_CAP'))
            nt.send(cp_feature.data('S', 2, 0, 1, 'SP_GENERIC_32'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'TIPS'))
            nt.send(cp_feature.data('S', 0, 0, 1, 'SHOW_ALL_TRACTORS'))

        if name == 'UPS':
            galaxy.ups = value
        # FIXME: process the other feature packets received

class SP_BADVERSION(SP):
    code = 21
    format = "!bbxx"
    why = None

    def handler(self, data):
        (ignored, why) = struct.unpack(self.format, data)
        self.why = why

class SP_PING(SP):
    """ only received if client sends CP_PING_RESPONSE after SP_LOGIN """
    code = 46
    format = "!bBHBBBB"

    def handler(self, data):
        (ignored, number, lag, tloss_sc, tloss_cs, iloss_sc, iloss_cs) = struct.unpack(self.format, data)
        if opt.sp: print "SP_PING"
        nt.send(cp_ping_response.data(0, 1, 0, 0))

class SP_UDP_REPLY(SP):
    """ only received if client sends CP_UDP_REQ """
    code = 28
    format = "!bbxxi"

    def handler(self, data):
        (ignored, reply, port) = struct.unpack(self.format, data)
        if opt.sp: print "SP_UDP_REPLY reply=%d port=%d" % (reply, port)
        nt.sp_udp_reply(reply, port)

class SP_SEQUENCE(SP):
    """ the first packet the server sends in an update, followed by a
    variable number of packets with no terminating indication.  only
    received if client sends CP_UDP_REQ requesting COMM_UDP, """
    code = 29
    format = "!bBH"

    def handler(self, data):
        (ignored, flag, sequence) = struct.unpack(self.format, data)
        galaxy.pace()
        if opt.sp:
            print # to make it clear on dump that a new update has commenced
            print "SP_SEQUENCE flag=%d sequence=%d" % (flag, sequence)

class SP_SHIP_CAP(SP):
    """ only received if client sends CP_FEATURE feature packet SHIP_CAP """
    code = 39
    format = "!bbHHHiiiiiiHHH1sx16s2sH"

    def handler(self, data):
        (ignored, operation, s_type, s_torpspeed, s_phaserrange, s_maxspeed, s_maxfuel, s_maxshield, s_maxdamage, s_maxwpntemp, s_maxegntemp, s_width, s_height, s_maxarmies, s_letter, s_name, s_desig, s_bitmap) = struct.unpack(self.format, data)
        if opt.sp: print "SP_SHIP_CAP operation=%d s_type=%d s_torpspeed=%d s_phaserrange=%d s_maxspeed=%d s_maxfuel=%d s_maxshield=%d s_maxdamage=%d s_maxwpntemp=%d s_maxegntemp=%d s_width=%d s_height=%d s_maxarmies=%d s_letter=%s s_name=%s s_desig=%s s_bitmap=%d" % (operation, s_type, s_torpspeed, s_phaserrange, s_maxspeed, s_maxfuel, s_maxshield, s_maxdamage, s_maxwpntemp, s_maxegntemp, s_width, s_height, s_maxarmies, s_letter, s_name, s_desig, s_bitmap)
        try:
            cap = galaxy.cap(s_type)
        except:
            print "SP_SHIP_CAP s_type was invalid: %d" % s_type
            return
        # check operation, zero add or change, one remove
        if operation == 1:
            cap.reset(s_type)
            return
        if operation != 0:
            print "SP_SHIP_CAP operation was invalid: %d" % operation
            return
        cap.seen = False
        cap.s_torpspeed = s_torpspeed
        cap.s_phaserrange = s_phaserrange
        cap.s_maxspeed = s_maxspeed
        cap.s_maxfuel = s_maxfuel
        cap.s_maxshield = s_maxshield
        cap.s_maxdamage = s_maxdamage
        cap.s_maxwpntemp = s_maxwpntemp
        cap.s_maxegntemp = s_maxegntemp
        cap.s_width = s_width
        cap.s_height = s_height
        cap.s_maxarmies = s_maxarmies
        cap.s_letter = s_letter
        cap.s_name = s_name
        cap.s_desig = s_desig
        cap.s_bitmap = s_bitmap

class SP_GENERIC_32(SP):
    """ only received if client sends CP_FEATURE of SP_GENERIC_32 """
    code = 32
    format = "!b1s30x"

    def handler(self, data):
        (ignored, version) = struct.unpack(self.format, data)
        if version == 'a':
            (ignored, version, repair_time, pl_orbit) = struct.unpack("b1shh26x", data)
            if opt.sp: print "SP_GENERIC_32 rt=%d or=%d" \
               % (repair_time, pl_orbit)
            if me:
                me.sp_generic_32(repair_time, pl_orbit)
        elif version == 'b':
            (ignored, version, repair_time, pl_orbit, gameup, \
             tournament_teams, tournament_age, tournament_age_units, \
             tournament_remain, tournament_remain_units, starbase_remain, \
             team_remain) = struct.unpack("!b1sHbHBBsBsBB18x", data)
            if opt.sp: print "SP_GENERIC_32 rt=%d or=%d gu=0x%x " \
               "tt=%x ta=%d%s tr=%d%s sr=%d su=%d" % \
               (repair_time, pl_orbit, gameup, tournament_teams, \
                tournament_age, tournament_age_units, tournament_remain, \
                tournament_remain_units, starbase_remain, team_remain)
            if me:
                me.sp_generic_32(repair_time, pl_orbit)
            galaxy.sp_generic_32(gameup, tournament_teams, \
                tournament_age, tournament_age_units, tournament_remain, \
                tournament_remain_units, starbase_remain, team_remain)
            # FIXME: lower update rate while ^GU_UNSAFE

""" user interface display phases
"""

class Phase:
    """ display phases common code """
    def __init__(self):
        self.ue_hz = 10
        self.ue_delay = 1000 / self.ue_hz
        self.screenshot = 0
        self.run = False
        self.eh_md = [] # event handlers, mouse down
        self.eh_mu = [] # event handlers, mouse up
        self.eh_mm = [] # event handlers, mouse movement
        self.eh_ue = [] # event handlers, user events (timers)

    def eh_add_clickable(self, b):
        self.eh_md.append(b.md)
        self.eh_mu.append(b.mu)
        self.eh_mm.append(b.mm)

    def eh_del_clickable(self, b):
        if b.md in self.eh_md: self.eh_md.remove(b.md)
        if b.mu in self.eh_mu: self.eh_mu.remove(b.mu)
        if b.mm in self.eh_mm: self.eh_mm.remove(b.mm)

    def network_sink(self):
        return nt.recv()

    def display_sink_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.md(event)
        elif event.type == pygame.KEYDOWN:
            self.kb(event)
        elif event.type == pygame.QUIT:
            nt.send(cp_bye.data())
            # FIXME: exit main instead of calling sys.exit
            sys.exit(0)
        elif event.type == pygame.MOUSEMOTION:
            self.mm(event)
        elif event.type > pygame.USEREVENT:
            self.ue(event)
        elif event.type == pygame.MOUSEBUTTONUP:
            self.mu(event)

    def display_sink(self):
        n = 0
        for event in pygame.event.get():
            self.display_sink_event(event)
            n += 1
        return n

    def display_sink_wait(self):
        self.display_sink()
        event = pygame.event.wait()
        self.display_sink_event(event)

    def ue(self, event):
        for eh in self.eh_ue:
            if eh(event): return True
        return False

    def ue_set(self, hz):
        self.ue_hz = hz
        self.ue_delay = 1000 / hz
        pygame.time.set_timer(pygame.USEREVENT+1, self.ue_delay)

    def ue_clear(self):
        pygame.time.set_timer(pygame.USEREVENT+1, 0)

    def mm(self, event):
        # FIXME: watch for MOUSEMOTION and update object information panes
        # for planets or ships (on tactical or galactic)
        for eh in self.eh_mm:
            if eh(event): return True
        return False

    def md(self, event):
        for eh in self.eh_md:
            if eh(event): return True
        return False

    def mu(self, event):
        for eh in self.eh_mu:
            if eh(event): return True
        return False

    def kb(self, event):
        if event.key == K_q:
            self.quit(event)
        elif event.key == K_ESCAPE:
            self.snap(event)

    def exit(self, status):
        screen.fill((0, 0, 0))
        pygame.display.flip()
        if opt.debug:
            ic.statistics()
        pg_quit()
        # FIXME: exit main instead of calling sys.exit
        sys.exit(status)

    def quit(self, event):
        if nt.mode != None:
            nt.send(cp_quit.data())
            nt.has_quit = True
        else:
            self.exit(0)

    def snap(self, event):
        name = "gytha-%04d.jpeg" % self.screenshot
        pygame.image.save(screen, name)
        print "snapshot taken,", name
        self.screenshot += 1

    def cycle(self):
        """ free wheeling cycle, use when it is acceptable to block on
        either display or network events, without local user event
        timers (a timer scheduled in this mode will not fire until
        after a display or network event occurs) """
        while self.run:
            self.network_sink()
            self.display_sink()

    def cycle_wait(self):
        """ display waiting cycle, use when local user event timers
        are needed """
        while self.run:
            self.network_sink()
            self.display_sink_wait()

    def cycle_wait_display(self):
        """ display waiting cycle, use when local user event timers
        are needed, and no network events """
        while self.run:
            self.display_sink_wait()

class PhaseNonFlight(Phase):
    def __init__(self):
        Phase.__init__(self)
        self.buttons = pygame.sprite.OrderedUpdates(())
        self.warn_on = False
        self.warn_fuse = 0

    def background(self, name="invalid.png"):
        # centre a background image onto the screen
        screen.fill((0,0,0))
        if opt.no_backgrounds: return
        if r_main.width > 1024 or r_main.height > 1000:
            background = ic.get_scale2xed(name)
        else:
            background = ic.get(name)
        bh = background.get_height()
        bw = background.get_width()
        tr = background.get_rect(center=(r_main.centerx, r_main.centery))
        screen.blit(background, tr)

    def _place_top_left(self, rect, arg):
        return rect(left=1, top=1)

    def _place_top_right(self, rect, arg):
        return rect(right=r_main.right-1, top=1)

    def _place_bottom_right(self, rect, arg):
        return rect(right=r_main.right-1, bottom=r_main.bottom-1)

    def _place_bottom_left(self, rect, arg):
        return rect(left=r_main.left+1, bottom=r_main.bottom-1)

    def _add_button(self, button):
        button.draw()
        self.eh_add_clickable(button)
        self.buttons.add(button)

    def _del_button(self, button):
        button.clear()
        self.eh_del_clickable(button)
        self.buttons.remove(button)

    def add_quit_button(self, clicked, image='activity-stop.png',
                        placement=None):
        self.b_quit = IconTextButton(clicked, True, image,
                                     'QUIT', 18, (192, 192, 192),
                                     self._place_bottom_right, None)
        self._add_button(self.b_quit)

    def add_list_button(self, clicked, image='system-restart.png'):
        self.b_list = IconTextButton(clicked, False, image,
                                     'Server List', 18, (192, 192, 192),
                                     self._place_bottom_left, None)
        self._add_button(self.b_list)

    def add_tips_button(self, clicked):
        self.b_tips = IconTextButton(clicked, False, 'help.png',
                                     'Tips for Getting Started',
                                     18, (192, 192, 192),
                                     self.place_above_welcome, 10)
        self._add_button(self.b_tips)

    def add_join_button(self, clicked):
        self.b_join = IconTextButton(clicked, False, 'go-previous.png',
                                     'Play Again', 18, (192, 192, 192),
                                     self.place_above_blame, 20)
        self._add_button(self.b_join)
        # FIXME: show shortcut space bar

    def del_join_button(self):
        self._del_button(self.b_join)
        del self.b_join

    def text(self, text, x, y, size=72, colour=(255, 255, 255)):
        font = fc.get(FONT_SANS, size)
        ts = font.render(text, 1, colour)
        tr = ts.get_rect(center=(x, y))
        screen.blit(ts, tr)
        return tr

    def blame(self):
        text_a = "software by quozl@us.netrek.org and stephen@thorne.id.au"
        text_b = ""
        if not opt.no_backgrounds: text_b += "backgrounds by hubble, "
        text_b += "ships by pascal"
        tra = self.text(text_a, r_main.centerx, r_main.bottom-90, 16)
        trb = self.text(text_b, r_main.centerx, r_main.bottom-70, 16)
        self.blame_rect = pygame.Rect.union(tra, trb)

    def place_above_blame(self, rect, arg):
        return rect(centerx=self.blame_rect.centerx,
                    bottom=self.blame_rect.top-arg)

    def welcome(self, colour=(255, 255, 255)):
        font = fc.get(FONT_SANS, 15)
        x = r_main.centerx - 300
        y = int(r_main.bottom * 0.79)
        wr = None
        for line in WELCOME:
            ts = font.render(line, 1, colour)
            tr = ts.get_rect(left=x, top=y)
            y = tr.bottom
            screen.blit(ts, tr)
            if wr:
                wr = pygame.Rect.union(wr, tr)
            else:
                wr = tr
        self.welcome_rect = wr

    def place_above_welcome(self, rect, arg):
        return rect(centerx=self.welcome_rect.centerx,
                    bottom=self.welcome_rect.top-arg)

    def warn(self, message, ms=0):
        font = fc.get(FONT_SANS, 32)
        text = font.render(message, 1, (255, 127, 127))
        self.warn_br = text.get_rect(centerx=r_main.centerx,
                                     bottom=r_main.bottom)
        self.warn_bg = screen.subsurface(self.warn_br.clip(screen.get_rect())).copy()
        r1 = screen.blit(text, self.warn_br)
        pygame.display.update(r1)
        self.warn_on = True
        self.warn_fuse = ms / self.ue_delay

    def unwarn(self):
        if self.warn_on:
            r1 = screen.blit(self.warn_bg, self.warn_br)
            pygame.display.update(r1)
            self.warn_on = False

    def warn_ue(self):
        if self.warn_fuse > 0:
            self.warn_fuse = self.warn_fuse - 1
            if self.warn_fuse == 0:
                self.unwarn()

    def mm(self, event):
        for eh in self.eh_mm:
            if eh(event):
                r = []
                for s in self.buttons:
                    if s.update():
                        s.clear()
                        r.append(s.draw())
                if len(r):
                    pygame.display.update(r)
                return True
        return False

class PhaseSplash(PhaseNonFlight):
    """ splash screen, shows welcome for a short time, and the player
    is to either wait for the timer to expire, or click to cancel """
    def __init__(self, screen):
        PhaseNonFlight.__init__(self)
        self.background("hubble-helix.jpg")
        self.text("netrek", r_main.centerx, r_main.centery, 144)
        self.bouncer = Bouncer(200, 200, r_main.centerx, r_main.centery,
                               'torp-explode-20.png', 'torp-explode-20.png')
        self.welcome()
        self.add_quit_button(self.quit)
        if not opt.debug: ic.preload_scan()
        pygame.display.flip()
        if opt.screenshots:
            pygame.image.save(screen, "gytha-splash.jpeg")
        if not opt.debug: ic.preload_early()
        self.ue_set(100)
        self.fuse_max = self.fuse = opt.splashtime / self.ue_delay
        self.run = True
        self.cycle_wait_display() # returns after self.leave is called
        if not opt.debug: ic.preload_rest()
        self.ue_clear()

    def ue(self, event):
        self.fuse -= 1
        if self.fuse < 0:
            self.leave()
        else:
            self.bouncer.update(self.fuse, self.fuse_max)
        if not opt.debug: ic.preload_one()

    def md(self, event):
        if Phase.md(self, event): return
        self.leave()

    def kb(self, event):
        self.leave()

    def leave(self):
        self.b_quit.clear()
        pygame.display.flip()
        self.run = False

class PhaseTips(PhaseNonFlight):
    """ playing tips documentation screen, shows tips text, and the
    player is to click on the server list or quit button """
    def __init__(self, screen):
        PhaseNonFlight.__init__(self)
        self.background("hubble-helix.jpg")
        self.text('netrek', r_main.centerx, 100, 92)
        self.text('tips', r_main.centerx, 175, 64)
        self.draw_tips()
        self.add_quit_button(self.quit)
        self.add_list_button(self.list)
        pygame.display.flip()
        if opt.screenshots:
            pygame.image.save(screen, "gytha-tips.jpeg")
        self.run = True
        self.cycle_wait_display() # returns after self.leave is called

    def draw_tips(self):
        tips = [
    "1.  when you enter the game, press the number 4 to start moving, other",
    "numbers are slower or faster,",
    "",
    "2.  you are the ship in the centre of the screen,",
            # FIXME: but not if you are in galactic view
    "",
    "3.  use right-click on the mouse to steer toward a point in space, you",
    "will find it easier to turn at lower speeds,",
    "",
    "4.  use left-click on the mouse to fire a torpedo, they travel over time",
    "so you have to point ahead of your target, they hurt enemy ships but",
    "usually pass right through your team,",
    "",
    "5.  use middle-click on your mouse to fire a phaser, it is instant so",
    "point at your target, it works better the closer the enemy is,",
    "",
    "6.  the aim of the game is to capture planets, killing enemies is only a",
    "means to an end, and dying is a good thing, because you get a new ship,",
    "",
    "7.  but if someone kills you, they can begin to capture planets, so it",
    "is best to not die in vain,",
    "",
    "8.  people in your team will try to communicate so that you can all do",
    "things together, because when you cooperate better than the other team,",
    "you win,",
    "",
    "9.  you capture planets by getting a kill, picking up armies 'z', bombing",
    "the enemy planet 'b', then dropping the armies 'x' until it changes team.",
    "",
# (client does not yet support observing well)
#    "Observing is a good way to learn.  When you join as an observer, you",
#    "won't see much until you use 'l' (lower-case L) to lock on to a player.",
#    "Choose a good player and watch what they do.",
#    "",
    "For more information on Netrek, visit http://netrek.org/beginner",
]
        size = 20
        x = r_main.centerx - 380
        y = 260
        if r_main.height < 1000:
            size = 15
            x = r_main.centerx - 280
            y = 210
        if r_main.height < 601:
            size = 10
            x = r_main.centerx - 180
        font = fc.get(FONT_SANS, size)
        for line in tips:
            ts = font.render(line, 1, (255, 255, 255))
            tr = ts.get_rect(left=x, top=y)
            y = tr.bottom
            screen.blit(ts, tr)

    def list(self, event):
        self.leave()

    def leave(self):
        self.b_quit.clear()
        pygame.display.flip()
        self.run = False

class PhaseServers(PhaseNonFlight):
    """ metaserver list, a list of services is shown, the list is
    derived from the metaserver and multicast discovery, and the
    player is to either select one with mouse, wait for the list to
    update, or quit. """
    def __init__(self, screen, mc):
        self.cancelled = False
        PhaseNonFlight.__init__(self)
        self.screen = screen
        self.background("hubble-orion.jpg")
        x = r_main.centerx
        self.text('netrek', x, 100, 92)
        self.text('server list', x, 175, 64)
        self.welcome(colour=(128, 128, 128))
        self.add_quit_button(self.quit)
        self.add_tips_button(self.tips)
        self.instructions = None
        self.pinger = None
        pygame.display.flip()
        self.bouncer = Bouncer(225, 20, x, 240)
        self.dy = 40 # vertical spacing
        self.n = 0 # number of servers shown so far
        self.run = True
        self.mc = mc
        self.mc.uncork(self.update)
        self.timing = False
        self.sent = pygame.time.get_ticks()
        self.lag = 0
        self.ue_set(100)
        self.fuse_max = opt.metaserver_refresh_interval * 1000 / self.ue_delay
        self.fuse = self.fuse_max / 2
        self.warn('pick a server to connect to', 2500)
        self.cycle_wait() # returns after self.leave is called
        self.ue_clear()

    def server_icon(self):
        # IMAGERY: servers-icon.png
        return [ic.get('servers-icon.png'), None]

    def server_name(self, server):
        """ server name, shade by age """
        colour = 96
        age = server['age']
        if age < 3000: colour = 128
        if age < 300: colour = 192
        if age < 180: colour = 255
        colour = (colour, colour, colour)
        font = fc.get(FONT_SANS, 22)
        text = server['name'] + ' ' + server['comment']
        return [font.render(text, 1, colour), 40]

    def server_queue(self, server):
        font = fc.get(FONT_SANS, 22)
        text = 'Queue of ' + str(server['queue'])
        return [font.render(text, 1, (255, 64, 64)), r_main.centerx - 120]

    def server_players(self, server):
        s = []
        # per player icon
        gx = r_main.centerx - 55
        for x in range(min(server['players'], 16)):
            # per player icon
            # IMAGERY: servers-player.png
            s.append([ic.get('servers-player.png'), gx])
            # space them out for visual counting
            if (x % 4) == 3:
                gx = gx + 35
            else:
                gx = gx + 30
        return s

    def update(self, name):
        """ called by MetaClient for each server for which a packet is received
        """
        # FIXME: seen once, placement problem, a newly available
        # multicast server is placed at first position despite first
        # position being taken already by a metaserver entry.
        # FIXME: old multicast entries not expired when they leave.
        redraw = []
        # defer instructions until at least one server appears
        if not self.instructions and r_us.height > 600:
            self.instructions = Texts(INSTRUCTIONS_SERVERS,
                                      r_main.centerx - 300,
                                      r_main.height * 0.53, 8, 15,
                                      name=FONT_SANS)
            rs = self.instructions.draw()
            for r in rs:
                redraw.append(r)
        server = self.mc.servers[name]
        if self.timing and server['source'] == 'r':
            self.lag = pygame.time.get_ticks() - self.sent
            x = 'ping ' + str(self.lag) + ' ms'
            def place(rect, arg):
                x, y = arg
                return rect(centerx=x, centery=y)
            self.pinger = Text(x, place, (r_main.centerx, 240), 14, (255, 255, 255))
            redraw.append(self.pinger.draw())
            self.timing = False
        if 'y' not in server:
            y = 300 + self.dy * self.n
            self.n += 1
        else:
            y = server['y']
            button = server['button']
            redraw.append(button.clear())
            self.eh_del_clickable(button)
            self.buttons.remove(button)
        s = []
        s.append(self.server_icon())
        s.append(self.server_name(server))
        if server['queue'] > 0:
            s.append(self.server_queue(server))
        else:
            s += self.server_players(server)
        s.append([pygame.Surface((1, 1), pygame.SRCALPHA, 32), r_main.width-110])
        def place_y(rect, y):
            return rect(left=55, centery=y)
        button = HorizontalAssemblyButton(self.join, s, 0, place_y, y)
        button.buttons = [1, 2]
        self.buttons.add(button)
        self.eh_add_clickable(button)
        button.check_cursor_under()
        self.mc.servers[name]['y'] = y
        self.mc.servers[name]['button'] = button
        redraw.append(button.draw())
        pygame.display.update(redraw)

    def network_sink(self):
        """ redefining the standard network_sink: while on this screen
        in particular, check for replies from the metaserver that we
        requested. """
        self.mc.recv()

    def ue(self, event):
        self.warn_ue()
        self.bouncer.update(self.fuse, self.fuse_max)

        self.fuse -= 1
        if self.fuse < 0:
            if self.pinger:
                pygame.display.update(self.pinger.clear())
                self.pinger = None
            self.sent = pygame.time.get_ticks()
            self.timing = True
            self.mc.query(opt.metaserver)
            self.fuse = self.fuse_max

    def md(self, event):
        if Phase.md(self, event): return
        self.unwarn()
        if event.button != 1 and event.button != 2:
            self.warn('not that button, mate', 500)
            return
        y = event.pos[1]
        if abs(self.bouncer.cy - y) < 50:
            self.warn('that is the metaserver query refresh timer, mate', 2000)
            return

    def join(self, event):
        self.unwarn()
        if event.button != 1 and event.button != 2:
            self.warn('not that button, mate', 500)
            return
        y = event.pos[1]
        distance = self.dy
        chosen = None
        for k, v in self.mc.servers.iteritems():
            dy = abs(v['y'] - y)
            if dy < distance:
                distance = dy
                chosen = v['name']
        if chosen == None:
            self.warn('click on a server, mate', 1000)
            return
        if opt.screenshots:
            pygame.image.save(screen, "gytha-servers.jpeg")
        pygame.display.update(self.b_quit.clear())
        self.warn('connecting, standby')
        opt.chosen = chosen
        if event.button == 2:
            opt.name = 'guest'
            opt.mercenary = True
        # FIXME: do not block and hang during connect, do it asynchronously
        if not nt.connect(opt.chosen, opt.port):
            # FIXME: handle connection failure more gracefully by
            # explaining what went wrong, rather than be this obtuse
            self.unwarn()
            self.warn('connection failure', 2000)
            pygame.display.update(self.b_quit.draw())
            return
        self.leave()

    def tips(self, event):
        self.cancelled = True
        self.leave()

    def leave(self):
        pygame.display.update(self.b_tips.clear())
        pygame.display.update(self.b_quit.clear())
        self.run = False

class PhaseQueue(PhaseNonFlight):
    """ queue, the player is told their position in the queue, the
    position updates as other players leave, or our player may
    quit. """
    def __init__(self, screen):
        self.cancelled = False
        if me != None:
            return
        PhaseNonFlight.__init__(self)
        self.background("hubble-crab.jpg")
        x = r_main.centerx
        self.text('netrek', x, 100, 92)
        self.text(opt.chosen, x, 185, 64)
        self.blame()
        self.add_quit_button(self.quit)
        self.add_list_button(self.list)
        self.warn('connected, standby')
        pygame.display.flip()
        self.run = True
        if opt.screenshots:
            pygame.image.save(screen, "gytha-queue.jpeg")
        while self.run:
            packets = self.network_sink()
            if packets > 0: self.data()
            self.display_sink()

    def data(self):
        if me != None:
            self.proceed()
            return
        if galaxy.sp_queue_pos == None:
            return
        self.unwarn()
        self.warn('standby, you are at queue position ' +
                  str(galaxy.sp_queue_pos))
        pygame.display.flip()

    def list(self, event):
        self.cancelled = True
        nt.send(cp_bye.data())
        nt.shutdown()
        self.proceed()

    def quit(self, event):
        self.list(event)
        Phase.quit(self, event)

    def proceed(self):
        self.b_quit.clear()
        self.b_list.clear()
        pygame.display.flip()
        self.run = False

class PhaseLogin(PhaseNonFlight):
    """ login, the server message of the day (MOTD) is displayed, and
    the player is to type a character name and password, the name may
    be guest, or the player may quit. """
    def __init__(self, screen):
        PhaseNonFlight.__init__(self)
        self.background("hubble-crab.jpg")
        x = r_main.centerx
        self.text('netrek', x, 100, 92)
        self.text(opt.chosen, x, 185, 64)
        self.blame()
        pygame.display.flip()
        self.add_quit_button(self.quit)
        self.add_list_button(self.list)
        self.unwarn()
        self.warn('connected, as slot %s, ready to login' % slot_decode(me.n))
        self.texts = Texts(galaxy.motd.get(), 100, 250, 24, 16)
        pygame.display.flip()
        self.name = Field("type a name ? ", "", x, r_main.height * 0.75)
        self.focused = self.name
        self.password = None
        self.run = True
        if opt.screenshots:
            pygame.image.save(screen, "gytha-login.jpeg")
        self.cancelled = False
        self.cycle() # returns when login is complete, or cancelled

    def tab(self):
        # FIXME: just press enter for guest
        """ move to next field """
        self.focused.leave()
        if self.focused == self.password:
            self.chuck_cp_login()
        elif self.focused == self.name:
            if self.password == None:
                self.password = Field("password ? ", "",
                                      r_main.centerx, r_main.height*0.8,
                                      echo=False)
                # FIXME: password prompt appears momentarily if guest selected
                # FIXME: #1187683521 force no echo for password
            else:
                self.password.enter()
            self.focused = self.password
            if self.name.value == 'guest' or self.name.value == 'Guest':
                self.password.leave()
                self.password.undraw()
                self.password.value = ''
                self.chuck_cp_login()
            else:
                self.chuck_cp_login_attempt()

    def chuck_cp_login_attempt(self):
        self.catch_sp_login_attempt()
        nt.send(cp_login.data(1, str(self.name.value),
                              str(self.password.value), 'gytha'))

    def throw_sp_login_attempt(self, accept, flags, keymap):
        if accept == 1:
            self.warn('server has this name listed')
        else:
            self.warn('server ignorant of this name')

    def catch_sp_login_attempt(self):
        global sp_login
        sp_login.catch(self.throw_sp_login_attempt)

    def chuck_cp_login(self):
        self.catch_sp_login()
        nt.send(cp_updates.data(1000000/opt.updates))
        nt.send(cp_login.data(0, str(self.name.value),
                              str(self.password.value), 'gytha'))

    def throw_sp_login(self, accept, flags, keymap):
        if accept == 1:
            self.proceed()
        else:
            self.warn('name and password refused by server')
            self.password.value = ''
            self.password.unhighlight()
            self.focused = self.name
            self.focused.enter()

    def catch_sp_login(self):
        global sp_login
        sp_login.catch(self.throw_sp_login)

    def untab(self):
        if self.focused == self.password:
            self.focused.leave()
            self.focused = self.name
            self.focused.redraw()

    def kb(self, event):
        self.unwarn()
        shift = event.mod & KMOD_SHIFT
        control = event.mod & KMOD_CTRL
        if event.key == K_LSHIFT or event.key == K_RSHIFT: pass
        elif event.key == K_LCTRL or event.key == K_RCTRL: pass
        elif event.key == K_d and control:
            self.list(event)
        elif event.key == K_w and control:
            self.focused.delete()
        elif event.key == K_TAB and shift:
            self.untab()
        elif event.key == K_TAB or event.key == K_RETURN:
            self.tab()
        elif event.key == K_BACKSPACE:
            self.focused.backspace()
        elif event.key > 31 and event.key < 255 and not control:
            self.focused.append(event.unicode)
        else:
            return Phase.kb(self, event)

    def list(self, event):
        self.cancelled = True
        nt.send(cp_bye.data())
        nt.shutdown()
        self.proceed()

    def quit(self, event):
        self.list(event)
        Phase.quit(self, event)

    def proceed(self):
        self.b_quit.clear()
        self.b_list.clear()
        pygame.display.flip()
        self.run = False

class PhaseOutfit(PhaseNonFlight):
    """ team and ship selection, the available teams and ships are
    displayed, and the player may select one, or quit """
    # FIXME: automatic quit timeout display
    # FIXME: add a become observer button that disconnects, reconnects, using same login credentials
    # FIXME: add a become player button as above
    # FIXME: add a relinquish slot button, for rejoining end of queue
    # FIXME: add a BACK button that disconnects, reconnects, for login
    def __init__(self, screen):
        PhaseNonFlight.__init__(self)
        self.run = True
        self.box = None
        self.last_team = None
        self.last_ship = CRUISER
        self.cancelled = False
        self.visible = pygame.sprite.OrderedUpdates(())
        self.angle = 0
        self.screenshot = False
        self.tips = None
        self.add_quit_button(self.quit)
        if not opt.server:
            self.add_list_button(self.list)

    def do(self):
        """ unlike the earlier display phases, this one exists for the
        duration of the session on a server, so the initialisation is
        split between first off (above) and per refit (below). """
        self.run = True
        self.background("hubble-spire.jpg")
        x = r_main.centerx
        self.text('netrek', x, 100, 92)
        self.text(opt.chosen, x, 185, 64)
        self.text('ship and race', x, 255, 64)
        self.blame()
        self.b_quit.draw()
        if not opt.server:
            self.b_list.draw()
        self.join_enabled = (self.last_team != None and not nt.has_quit)
        if self.join_enabled:
            # offer rejoin if a team was previously selected and
            # player did not quit
            self.add_join_button(self.join)
        pygame.display.flip()
        box_l = int(r_main.width * 0.212)
        box_t = 300
        box_r = r_main.width - box_l
        box_b = r_main.height - 250
        sx = (box_r - box_l) / 8
        sy = (box_b - box_t) / 8
        r = []
        self.sprites = []
        # FIXME: display number of players on each team
        # FIXME: make these sprites rather than paint on screen
        table = [[FED, -1, +1], [ROM, -1, -1], [KLI, +1, -1], [ORI, +1, +1]]
        for row in table:
            (team, dx, dy) = row
            # box centre
            # FIXME: slide ships into race on race positions, omitting other races
            x = (box_r - box_l) / 2 + box_l
            y = (box_b - box_t) / 2 + box_t
            permit = [CRUISER, ASSAULT, SCOUT, BATTLESHIP, DESTROYER, STARBASE]
            if rounds < 50: permit = permit[:-1]
            if rounds < 20: permit = [CRUISER, ASSAULT, SCOUT]
            if rounds < 10: permit = [CRUISER]
            for ship in permit:
                x = x + dx * sx
                y = y + dy * sy
                # IMAGERY: ???-??.png
                def place_xy(rect, arg):
                    (x, y) = arg
                    return rect(centerx=x, centery=y)
                sprite = IconButton(self.pick, teams[team]+'-'+ships[ship]+'.png', place_xy, (x, y))
                sprite.description = teams_long[team] + ' ' + ships_long[ship] + ', ' + ships_use[ship]
                sprite.x = x
                sprite.y = y
                sprite.ship = ship
                sprite.team = team
                sprite.visible = False
                sprite.suck()
                self.sprites.append(sprite)
        # FIXME: add minature galactic, showing ownership, player
        # positions if any, with ships to choose in each race space or
        # just outside the corner.
        # FIXME: display "in bronco you should remain with your team"
        # FIXME: show logged in players
        # FIXME: show planet status
        # FIXME: show whydead
        if not nt.has_quit:
            self.warn("pick a ship")
        pygame.display.update(r)
        sp_mask.catch(self.mask)
        self.cycle() # returns when choice accepted by server, or user cancels
        sp_mask.uncatch()
        if self.join_enabled:
            self.del_join_button()
        for sprite in self.sprites:
            if sprite.visible:
                self.visible.remove(sprite)
                self._del_button(sprite)
                r.append(sprite.clear())
                sprite.visible = False

    def mask(self, mask):
        r = []
        for sprite in self.sprites:
            if mask & sprite.team:
                if not sprite.visible:
                    self.visible.add(sprite)
                    self._add_button(sprite)
                    r.append(sprite.blit())
                    sprite.visible = True
            else:
                if sprite.visible:
                    self.visible.remove(sprite)
                    self._del_button(sprite)
                    r.append(sprite.clear())
                    sprite.visible = False
        if len(r) > 0:
            pygame.display.update(r)
            if opt.screenshots:
                if not self.screenshot:
                    pygame.image.save(screen, "gytha-outfit.jpeg")
                    self.screenshot = True
        if mask != 0 and opt.mercenary:
            opt.team = teams[mercenary.pick(mask, galaxy)]
            opt.ship = "cruiser"
            opt.mercenary = False
        self.auto()

    def auto(self):
        # attempt auto-refit if command line arguments are supplied
        if opt.team != None and opt.ship != None:
            while me == None:
                nt.recv()
                # FIXME: potential CPU loop at this point
            for team, name in teams_long.iteritems():
                if opt.team == name[:len(opt.team)]:
                    opt.team = None
                    for ship, name in ships.iteritems():
                        if opt.ship == name[:len(opt.ship)]:
                            self.team(teams_numeric[team], ship)
                            return
                    for ship, name in ships_long.iteritems():
                        if opt.ship == name[:len(opt.ship)]:
                            self.team(teams_numeric[team], ship)
                            return
                    break

    def team(self, team, ship):
        self.last_team = team
        self.last_ship = ship
        sp_pickok.catch(self.sp_pickok)
        nt.send(cp_outfit.data(team, ship))

    def sp_pickok(self, state):
        global rounds

        if state == 1:
            self.run = False
            rounds += 1
            return

        self.unwarn()

        if 'You need a rank' in sp_warning.text:
            self.warn('you lack rank to fly that ship')
            self.last_team = None
            return

        if 'Please confirm change of teams' in sp_warning.text:
            self.warn('changing team may insult, click again?')
            return

        self.warn('outfit request refused by server')

    def nearest(self, pos):
        (x, y) = pos
        nearest = None
        minimum = 70**2
        for sprite in self.sprites:
            if not sprite.visible: continue
            distance = (sprite.x - x)**2 + (sprite.y - y)**2
            if distance < minimum:
                nearest = sprite
                minimum = distance
        return nearest

    def pick(self, event):
        self.unwarn()
        nearest = self.nearest(event.pos)
        if nearest != None:
            self.team(teams_numeric[nearest.team], nearest.ship)
        # FIXME: click on team icon sends CP_OUTFIT most recent ship
        # FIXME: click on ship icon requests CP_OUTFIT with team and ship

    def mm(self, event):
        PhaseNonFlight.mm(self, event)
        nearest = self.nearest(event.pos)
        if nearest != self.box:
            self.unwarn()
            if nearest != None:
                self.warn(nearest.description)
            self.box = nearest

    def kb(self, event):
        self.unwarn()
        shift = event.mod & KMOD_SHIFT
        control = event.mod & KMOD_CTRL
        if event.key == K_LSHIFT or event.key == K_RSHIFT: pass
        elif event.key == K_LCTRL or event.key == K_RCTRL: pass
        elif event.key == K_d and control:
            self.list(event)
        elif event.key == K_SPACE or event.key == K_RETURN:
            self.join(event)
        elif event.key == K_f: self.team(0, self.last_ship)
        elif event.key == K_r: self.team(1, self.last_ship)
        elif event.key == K_k: self.team(2, self.last_ship)
        elif event.key == K_o: self.team(3, self.last_ship)
        else:
            return Phase.kb(self, event)

    def join(self, event):
        if self.last_team != None:
            self.team(self.last_team, self.last_ship)

    def list(self, event):
        nt.send(cp_bye.data())
        nt.shutdown()
        self.cancelled = True
        self.proceed()

    def quit(self, event):
        nt.send(cp_bye.data())
        nt.shutdown()
        self.exit(0)

    def proceed(self):
        self.b_quit.clear()
        if not opt.server:
            self.b_list.clear()
        pygame.display.flip()
        self.run = False


class PhaseFlight(Phase):
    def __init__(self, name):
        Phase.__init__(self)
        self.run = True
        self.name = name
        self.set_keys()
        self.eh_ue.append(b_warning_sprite.ue)
        self.modal_handler = None
        self.event_triggers_update = False
        self.eh_md.append(self.md_us)
        self.op_info_prior_target = None
        self.hinted = False

    def cycle(self):
        """ main in-flight event loop, returns when no longer flying """
        # at least one initial screen update is required to form the
        # playing field
        self.update()
        galaxy.frames += 1
        # loop until termination requested, or no longer flying
        while self.run:
            # pause until a burst of network packets are received and
            # processed, or display event occurs.
            packets = self.network_sink()
            # if a burst of network packets was processed, and one of
            # them signified the start of a new update cycle, do a
            # screen update.
            if packets and galaxy.paced:
                self.update()
                galaxy.paced = False
                galaxy.frames += 1
                #if opt.sp: print "**"
            # check for and process any display events, but don't wait
            # around for more, it is critical that we get back to
            # the head of this loop waiting for anything.
            events = self.display_sink()
            if events > 0:
                galaxy.events += 1
                if self.event_triggers_update:
                    self.update()
                    self.event_triggers_update = False
                #if opt.sp: print "--"
            if me.status == POUTFIT: break # no longer flying

    def update(self):
        raise NotImplemented

    def md_us(self, event):
        """ tactical window mouse button down event handler
        """
        if not r_us.collidepoint(event.pos):
            return False # event not handled

        if not me: return True # event handled
        (x, y) = event.pos
        if event.button == 3:
            nt.send(cp_direction.data(s2d(me, x, y)))
        elif event.button == 2:
            nt.send(cp_phaser.data(s2d(me, x, y)))
        elif event.button == 1:
            nt.send(cp_torp.data(s2d(me, x, y)))
        return True

    def is_control(self, event):
        return event.mod & KMOD_CTRL

    def is_shift(self, event):
        return event.mod & KMOD_SHIFT

    def is_escape(self, event):
        return (event.key == K_ESCAPE or
                (event.key == K_LEFTBRACKET and
                self.is_control(event)))

    def kb(self, event):

        # ignore the shift and control keys on their own
        if event.key == K_LSHIFT or event.key == K_RSHIFT: return
        if event.key == K_LCTRL or event.key == K_RCTRL: return

        # check for control key sequences pressed
        if (self.is_control(event)):
            if event.key in self.keys_control:
                (handler, argument) = self.keys_control[event.key][:2]
                handler(event, argument)
                return

        # check for message entry mode
        if self.modal_handler is not None:
            self.modal_handler(event)
            return

        # check for shift key sequences pressed
        if (self.is_shift(event)):
            if event.key in self.keys_shift:
                (handler, argument) = self.keys_shift[event.key][:2]
                handler(event, argument)
                return

        # check for normal keys pressed
        if event.key in self.keys_normal:
            (handler, argument) = self.keys_normal[event.key][:2]
            handler(event, argument)
            return

        return Phase.kb(self, event)

    def set_keys(self):
        """ define dictionaries to map keys to operations """
        self.keys_normal = {
            K_0: (self.op_warp, 0, 'engine stop'),
            K_1: (self.op_warp, 1),
            K_2: (self.op_warp, 2),
            K_3: (self.op_warp, 3),
            K_4: (self.op_warp, 4, 'cruise'),
            K_5: (self.op_warp, 5),
            K_6: (self.op_warp, 6),
            K_7: (self.op_warp, 7),
            K_8: (self.op_warp, 8),
            K_9: (self.op_warp, 9),
            K_SEMICOLON: (self.op_planet_lock, None, 'lock on planet'),
            K_b: (self.op_bomb, None, 'start bombing'),
            K_c: (self.op_cloak_toggle, None, 'cloak (on/off)'),
            K_d: (self.op_det, None, 'detonate nearby enemy torps'),
            K_e: (self.op_docking_toggle, None),
            K_f: (self.op_plasma, None),
            K_h: (self.op_help, None, 'help'),
            K_i: (self.op_info, None, 'show info about object'),
            K_k: (self.op_course, None),
            K_l: (self.op_player_lock, None, 'lock on player'),
            K_m: (self.op_message, None, 'compose a message'),
            K_o: (self.op_orbit, None, 'orbit planet'),
            K_p: (self.op_phaser, None),
            K_r: (self.op_refit, None, 'refit'),
            K_s: (self.op_shield_toggle, None, 'shields (on/off)'),
            K_t: (self.op_torp, None),
            K_u: (self.op_shield_toggle, None),
            K_x: (self.op_beam_down, None, 'beam down'),
            K_y: (self.op_pressor_toggle, None, 'pressor'),
            K_z: (self.op_beam_up, None, 'beam up'),
            K_BACKSPACE: (self.op_dismiss, None),
            }
        self.keys_control = {
            K_HASH: (self.op_distress, rcd.dist_type_other2),
            K_0: (self.op_distress, rcd.dist_type_pop),
            K_1: (self.op_distress, rcd.dist_type_save_planet),
            K_2: (self.op_distress, rcd.dist_type_base_ogg),
            K_3: (self.op_distress, rcd.dist_type_help1),
            K_4: (self.op_distress, rcd.dist_type_help2),
            K_5: (self.op_distress, rcd.dist_type_asw),
            K_6: (self.op_distress, rcd.dist_type_asbomb),
            K_7: (self.op_distress, rcd.dist_type_doing1),
            K_8: (self.op_distress, rcd.dist_type_doing2),
            K_9: (self.op_distress, rcd.dist_type_pickup),
            K_AT: (self.op_distress, rcd.dist_type_other1),
            K_b: (self.op_distress, rcd.dist_type_bomb),
            K_c: (self.op_distress, rcd.dist_type_space_control),
            K_e: (self.op_distress, rcd.dist_type_escorting,
                  'signal taker you are escort'),
            K_f: (self.op_distress, rcd.dist_type_free_beer),
            K_h: (self.op_distress, rcd.dist_type_crippled),
            K_l: (self.op_distress, rcd.dist_type_controlling),
            K_m: (self.op_distress, rcd.dist_type_bombing),
            K_n: (self.op_distress, rcd.dist_type_no_gas),
            K_o: (self.op_distress, rcd.dist_type_ogg),
            K_p: (self.op_distress, rcd.dist_type_ogging),
            K_t: (self.op_distress, rcd.dist_type_take,
                  'signal team you are taker'),
            }
        self.keys_shift = {
            K_COMMA: (self.op_warp_down, None),
            K_PERIOD: (self.op_warp_up, None),
            K_0: (self.op_warp, 10),
            K_1: (self.op_warp, 11),
            K_2: (self.op_warp, 12, 'max warp'),
            K_3: (self.op_warp_half, None),
            K_4: (self.op_null, None),
            K_5: (self.op_warp_full, None),
            K_6: (self.op_null, None),
            K_7: (self.op_null, None),
            K_8: (self.op_practice, None),
            K_9: (self.op_warp, 10),
            K_c: (self.op_snap, None),
            K_d: (self.op_det_me, None, 'cancel my torps'),
            K_e: (self.op_distress, rcd.dist_type_generic, 'emergency'),
            K_f: (self.op_distress, rcd.dist_type_carrying, 'carrying'),
            K_h: (self.op_help_keyboard, None),
            K_r: (self.op_repair, None, 'repair (on/off)'),
            K_t: (self.op_tractor_toggle, None, 'tractor (on/off)'),
            K_z: (self.op_debug_dump, None),
            }

    def op_null(self, event, arg):
        pass

    def op_beam_down(self, event, arg):
        nt.send(cp_beam.data(2))

    def op_beam_up(self, event, arg):
        nt.send(cp_beam.data(1))

    def op_bomb(self, event, arg):
        nt.send(cp_bomb.data())

    def op_cloak_toggle(self, event, arg):
        if not me: return
        if me.flags & PFCLOAK:
            nt.send(cp_cloak.data(0))
        else:
            nt.send(cp_cloak.data(1))

    def op_course(self, event, arg):
        (x, y) = pygame.mouse.get_pos()
        nt.send(cp_direction.data(s2d(me, x, y)))

    def op_det(self, event, arg):
        nt.send(cp_det_torps.data())

    def op_det_me(self, event, arg):
        if not me: return
        base = me.n * MAXTORP
        for x in range(base, base + MAXTORP):
            torp = galaxy.torp(x)
            if torp.status == TMOVE or torp.status == TSTRAIGHT:
                nt.send(cp_det_mytorp.data(x))

    def op_distress(self, event, arg):
        if not me: return
        mesg = rcd.pack(arg, cursor(me), me, galaxy)
        if mesg: nt.send(cp_message.data(MDISTR | MTEAM, me.team, mesg))

    def op_docking_toggle(self, event, arg):
        if not me: return
        if me.flags & PFDOCKOK:
            nt.send(cp_dockperm.data(0))
        else:
            nt.send(cp_dockperm.data(1))

    def op_info(self, event, arg):
        # first time, show info about thing
        # second time, dismiss info if key was pressed over same thing
        # and info is still visible,
        # otherwise, show info about thing.
        thing = galaxy.closest_thing(cursor(me))
        if self.op_info_prior_target == thing:
            self.op_info_prior_target = None
            if b_info:
                b_info.empty()
                return
        else:
            if b_info: b_info.empty()

        InfoSprite(thing.op_info(), track=thing)
        self.op_info_prior_target = thing

    def op_help(self, event, arg):

        # if help was previously requested and is still visible, dismiss it
        if self.op_info_prior_target == self.op_help:
            if b_info:
                b_info.empty()
                self.op_info_prior_target = None
                return

        # if info was previously requested and is still visible, destroy it
        if self.op_info_prior_target != None:
            if b_info:
                b_info.empty()

        tips = [
            "Netrek Help",
            "",
            "Press a number to set engine speed,",
            "",
            "You are the ship in the centre of the screen,",
            # FIXME: but not if you are in galactic view
            "",
            "Right-click to steer,",
            "",
            "Left-click to fire torpedo, point ahead of target,",
            "",
            "Middle-click to fire phaser, point at target,",
            "",
            "To orbit a planet point at it and press ' ; ',",
            "",
            "Killing enemy ships only moves them home,",
            "",
            "People in your team will try to communicate, please listen,",
            "",
            "Capture planets by getting a kill,",
            "   ... pick up armies from your planet with ' z ',",
            "   ... bomb the enemy planet with ' b ',",
            "   ... beam down the armies with ' x ',",
            "   ... repeat until it changes team.",
            "",
            "If someone kills you, they can begin to capture your planets,",
            "so come straight back in and defend!",
            "",
            "Press shift H for keyboard help, or backspace to clear"]

        InfoSprite(tips, expires=10+len(tips)*2)
        self.op_info_prior_target = self.op_help

    def op_help_keyboard(self, event, arg):

        # if help was previously requested and is still visible, dismiss it
        if self.op_info_prior_target == self.op_help_keyboard:
            if b_info:
                b_info.empty()
                self.op_info_prior_target = None
                return

        # if info was previously requested and is still visible, destroy it
        if self.op_info_prior_target != None:
            if b_info:
                b_info.empty()

        tips = ['Netrek Keyboard Help', '']
        gap = '  '
        for key, key_tuple in self.keys_normal.iteritems():
            if len(key_tuple) < 3: continue
            name = pygame.key.name(key)
            tips.append(name + gap + key_tuple[2])
        for key, key_tuple in self.keys_shift.iteritems():
            if len(key_tuple) < 3: continue
            name = 'shift ' + pygame.key.name(key).upper()
            tips.append(name + gap + key_tuple[2])
        for key, key_tuple in self.keys_control.iteritems():
            if len(key_tuple) < 3: continue
            name = 'control ' + pygame.key.name(key)
            tips.append(name + gap + key_tuple[2])
        # FIXME: sort these in a fashion that leads to learning
        # rather than the default order in the table
        tips.append('enter' + gap + 'switch view')
        tips.append('')
        tips.append('Press backspace to clear keyboard help.')

        InfoSprite(tips, expires=20+len(tips))
        self.op_info_prior_target = self.op_help_keyboard

    def op_dismiss(self, event, arg):
        if b_info:
            b_info.empty()
        self.op_info_prior_target = None

    def op_orbit(self, event, arg):
        nt.send(cp_orbit.data(1))

    def op_phaser(self, event, arg):
        (x, y) = pygame.mouse.get_pos()
        nt.send(cp_phaser.data(s2d(me, x, y)))

    def op_planet_lock(self, event, arg):
        nearest = galaxy.closest_planet(cursor(me))
        if nearest != me:
            nt.send(cp_planlock.data(nearest.n))
            me.planet = nearest

    def op_plasma(self, event, arg):
        (x, y) = pygame.mouse.get_pos()
        nt.send(cp_plasma.data(s2d(me, x, y)))

    def op_player_lock(self, event, arg):
        nearest = galaxy.closest_ship(cursor(me))
        if nearest != me:
            nt.send(cp_playlock.data(nearest.n))

    def op_practice(self, event, arg):
        nt.send(cp_practr.data())

    def op_pressor_toggle(self, event, arg):
        if not me: return
        nearest = galaxy.closest_ship(cursor(me))
        if nearest != me:
            if me.flags & PFPRESS:
                nt.send(cp_repress.data(0, nearest.n))
            else:
                nt.send(cp_repress.data(1, nearest.n))

    def op_repair(self, event, arg):
        if not me: return
        nt.send(cp_repair.data(1))

    def op_shield_toggle(self, event, arg):
        if not me: return
        if me.flags & PFSHIELD:
            nt.send(cp_shield.data(0))
        else:
            nt.send(cp_shield.data(1))

    def op_torp(self, event, arg):
        (x, y) = pygame.mouse.get_pos()
        nt.send(cp_torp.data(s2d(me, x, y)))

# FIXME: adopt netrek-client-cow tractor off, and reapply keys, $ (all
# off) _ (tractor off and reapply), ^ (pressor off and reapply)
    def op_tractor_toggle(self, event, arg):
        if not me: return
        nearest = galaxy.closest_ship(cursor(me))
        if nearest != me:
            if me.flags & PFTRACT:
                nt.send(cp_tractor.data(0, nearest.n))
            else:
                nt.send(cp_tractor.data(1, nearest.n))

    def op_warp(self, event, arg):
        nt.send(cp_speed.data(arg))
        self.hint_dismiss()

    def op_warp_half(self, event, arg):
        if me: self.op_warp(event, me.cap.s_maxspeed / 2)

    def op_warp_full(self, event, arg):
        if me: self.op_warp(event, me.cap.s_maxspeed)

    def op_warp_down(self, event, arg):
        if me: self.op_warp(event, me.speed - 1)

    def op_warp_up(self, event, arg):
        if me: self.op_warp(event, me.speed + 1)

    def op_message(self, event, arg):
        if me:
            galaxy.message.start()
            self.modal_handler = self.op_message_target
            self.event_triggers_update = True

    def op_message_target(self, event):
        self.event_triggers_update = True
        if self.is_escape(event) or \
               event.key == K_BACKSPACE or \
               event.key == K_m:
            galaxy.message.abort()
            self.modal_handler = None
            return
        if galaxy.message.target(event):
            self.modal_handler = self.op_message_typing

    def op_message_typing(self, event):
        self.event_triggers_update = True
        if self.is_escape(event):
            galaxy.message.abort()
            self.modal_handler = None
            return
        if event.key == K_BACKSPACE:
            if galaxy.message.is_empty():
                galaxy.message.retarget()
                self.modal_handler = self.op_message_target
                return
            galaxy.message.backspace()
            return
        if event.key == K_RETURN:
            galaxy.message.send()
            self.modal_handler = None
            return
        galaxy.message.typing(event)
        # FIXME: message history, up & down arrow recall

    def op_snap(self, event, arg):
        self.snap(event)

    def op_refit(self, event, arg):
        if me:
            self.modal_handler = self.op_refit_next
            self.event_triggers_update = True
            sp_warning.synthetic('Scout, Destroyer, Cruiser, '
                                 'Battleship, Assault, Outpost?')

    def op_refit_next(self, event):
        key = pygame.key.name(event.key)
        if key in ship_keys:
            nt.send(cp_refit.data(ship_keys[key]))
        self.modal_handler = None

    def tips(self):
        tips = galaxy.motd.tips()
        if not tips:
            return

        if b_info:
            b_info.empty()
        self.op_info_prior_target = self.tips
        tips.append('')
        tips.append('Press backspace to clear tips.')
        InfoSprite(tips, expires=10+len(tips))

    def hint(self):
        if self.hinted:
            return False

        tips = ['Press h for help']
        InfoSprite(tips, expires=300, track=Tag((me.x, me.y + 3000)))
        self.op_info_prior_target = self.hint
        self.hinted = True
        return True

    def hint_dismiss(self):
        if self.op_info_prior_target == self.hint:
            if b_info:
                b_info.empty()
            self.op_info_prior_target = None

    def op_debug_dump(self, event, arg):
        print galaxy


class PhaseFlightGalactic(PhaseFlight):
    def __init__(self):
        PhaseFlight.__init__(self, 'galactic')
        self.alerts = GalacticAlerts()

    def do(self):
        self.run = True
        screen.set_clip(r_us) # restrict drawing
        screen.blit(background, (0, 0))
        # draw static background, team borders and team names
        r = []
        xc, yc = n2gs(GWIDTH/2, GWIDTH/2)
        x1, y1 = n2gs(0, 0)
        x2, y2 = n2gs(GWIDTH, GWIDTH)
        r += [pygame.draw.line(screen, (96, 96, 96), (xc, y1), (xc, y2))]
        r += [pygame.draw.line(screen, (96, 96, 96), (x1, yc), (x2, yc))]
        t = (galaxy.tournament_teams & 0xf) | (galaxy.tournament_teams >> 4)
        if t == 0:
            t = ALL_TEAMS

        if r_us.width == 1000 and r_us.height == 1000:

            if t & ROM:
                ts = ic.get('team-box-rom.png')
                tr = ts.get_rect(left=x1, top=y1)
                screen.blit(ts, tr)
                r += [tr]

            if t & FED:
                ts = ic.get('team-box-fed.png')
                tr = ts.get_rect(left=x1, bottom=y2)
                screen.blit(ts, tr)
                r += [tr]

            if t & ORI:
                ts = ic.get('team-box-ori.png')
                tr = ts.get_rect(right=x2, bottom=y2)
                screen.blit(ts, tr)
                r += [tr]

            if t & KLI:
                ts = ic.get('team-box-kli.png')
                tr = ts.get_rect(right=x2, top=y1)
                screen.blit(ts, tr)
                r += [tr]

        size = 24
        font = fc.get(FONT_SANS, size)

        ts = font.render('Romulan', 1, (255, 64, 64))
        tr = ts.get_rect(left=x1+2, top=y1+2)
        screen.blit(ts, tr)
        r += [tr]

        ts = font.render('Federation', 1, (255, 255, 64))
        tr = ts.get_rect(left=x1+2, bottom=y2-2)
        screen.blit(ts, tr)
        r += [tr]

        ts = font.render('Orion', 1, (64, 255, 255))
        tr = ts.get_rect(right=x2-2, bottom=y2-2)
        screen.blit(ts, tr)
        r += [tr]

        ts = font.render('Klingon', 1, (64, 255, 64))
        tr = ts.get_rect(right=x2-2, top=y1+2)
        screen.blit(ts, tr)
        r += [tr]

        # FIXME: galactic to be centered on main screen for
        # --width=800 --height=600 --no-fullscreen

        pygame.display.update(r)
        self.bg = screen.copy()
        screen.set_clip(r_main)
        self.cycle()

    def kb(self, event):
        global ph_flight
        if (event.key == K_RETURN or event.key == K_TAB) and self.modal_handler is None:
            ph_flight = ph_tactical
            self.run = False
        else:
            return PhaseFlight.kb(self, event)

    def update(self):
        t0 = time.time()
        screen.set_clip(r_us) # restrict drawing
        r = [] # sequence of dirty rectangles for update
        r += self.alerts.undraw((0,0,0))
        b_info.clear(screen, self.bg)
        b_warning.clear(screen, self.bg)
        b_reports.clear(screen, self.bg)
        g_players.clear(screen, self.bg)
        g_planets.clear(screen, self.bg)
        g_locator.clear(screen, self.bg)

        g_locator.update()
        g_planets.update()
        g_players.update()
        b_warning.update()
        b_reports.update()
        b_info.update()

        r += g_locator.draw(screen)
        r += g_planets.draw(screen)
        r += g_players.draw(screen)
        r += b_reports.draw(screen)
        r += b_warning.draw(screen)
        r += self.alerts.draw()
        r += b_info.draw(screen)
        pygame.display.update(r)
        screen.set_clip(r_main)
        t1 = time.time()
        galaxy.rps = int ( 1 / ( t1 - t0 ) )

class PhaseFlightTactical(PhaseFlight):
    def __init__(self):
        PhaseFlight.__init__(self, 'tactical')
        self.borders = Borders()
        self.alerts = TacticalAlerts()
        self.subgalactic = Subgalactic()
        self.halos = Halos()

        self.co = (0, 0, 0)
        self.bg = screen.copy()
        self.bg.fill(self.co)

        self.pace = 0

    def do(self):
        global background

        self.saved_background = background
        self.run = True
        screen.blit(self.bg, (0, 0))
        self.cycle()
        background = self.saved_background

    def kb(self, event):
        global ph_flight
        if (event.key == K_RETURN or event.key == K_TAB) and self.modal_handler is None:
            ph_flight = ph_galactic
            self.run = False
        else:
            return PhaseFlight.kb(self, event)

    # FIXME: subgalactic in a corner, alpha blended
    # FIXME: console in a corner
    # FIXME: action menu items around edge
    # FIXME: menu item "?" or mouse-over, to do modal information
    # query on a screen object.

    def extra(self):
        """ some extra graphics bits, where we tune automatically how
        much extra graphics are done according to the measured
        performance of the essential graphics, ... otherwise once we
        fall behind in graphics update the network packet will be
        already waiting, and we shall begin to display-lag.  """

        # if we are incapable of a greater local frame rate than the
        # server is configured to send us updates for, defer one in
        # ten of these extra graphics updates
        if galaxy.rps < galaxy.ups:
            self.pace += 1
            if self.pace < 10: return []
            self.pace = 0

        # update halos
        r = []
        self.halos.undraw(screen, self.co)
        r += self.halos.undraw(self.bg, self.co)
        self.halos.draw(screen)
        r += self.halos.draw(self.bg)
        return r

    def update(self):
        """ clear, update, and redraw all tactical sprites and non-sprites """

        t0 = time.time()
        screen.set_clip(r_us) # restrict drawing
        r = [] # sequence of dirty rectangles for update
        r += galaxy.tractors_undraw(self.co)
        r += galaxy.phasers_undraw(self.co)
        r += self.borders.undraw(self.co)
        r += self.alerts.undraw(self.co)
        r += self.subgalactic.undraw(self.co)

        # design note, the sprite clear method does not return a dirty
        # rectangle, because it is merged with the dirty rectangle
        # returned by the sprite draw method, per group class
        # RenderUpdates, which is a subclass of the group class
        # OrderedUpdates that we use here.
        b_info.clear(screen, self.bg)
        b_message.clear(screen, self.bg)
        b_reports.clear(screen, self.bg)
        b_warning.clear(screen, self.bg)
        t_torps.clear(screen, self.bg)
        t_plasma.clear(screen, self.bg)
        t_players.clear(screen, self.bg)
        t_planets.clear(screen, self.bg)

        r += self.extra()
        t_planets.update()
        t_players.update()
        t_plasma.update()
        t_torps.update()
        b_warning.update()
        b_reports.update()
        b_message.update()
        b_info.update()

        r += self.subgalactic.draw()
        r += t_planets.draw(screen)
        r += galaxy.tractors_draw()
        r += t_players.draw(screen)
        r += t_plasma.draw(screen)
        r += t_torps.draw(screen)
        r += galaxy.phasers_draw()
        r += self.borders.draw()
        r += self.alerts.draw()
        r += b_reports.draw(screen)
        r += b_warning.draw(screen)
        r += b_message.draw(screen)
        r += b_info.draw(screen)

        pygame.display.update(r)
        screen.set_clip(r_main)
        t1 = time.time()
        galaxy.rps = int ( 1 / ( t1 - t0 ) )

        #r_debug = galaxy.torp_debug_draw()
        #pygame.display.update(r_debug)
        #r_debug = galaxy.ship_debug_draw()
        #pygame.display.update(r_debug)

class PhaseDisconnected(PhaseNonFlight):
    def __init__(self, screen):
        PhaseNonFlight.__init__(self)
        self.background("hubble-helix.jpg")
        x = r_main.centerx
        self.text('netrek', x, 100, 92)
        self.text(opt.chosen, x, 185, 64)
        self.text('disconnected', x, 255, 64)
        y = 455
        size = 12
        if r_main.width < 801:
            size = 10
            y = 350
        self.texts = Texts(self.diagnosis(), 50, y, size, 18)
        self.add_quit_button(self.quit)
        if not opt.server:
            self.add_list_button(self.list)
        pygame.display.flip()
        self.run = True
        self.cycle()
        # FIXME: show last few lines of message log
        # FIXME: if freed by captain in clue game from player slot
        # automatically return as an observer slot
        # FIXME: offer rejoin as player and rejoin as observer buttons

    def diagnosis(self):
        if sp_badversion.why == None:
            return ['Connection was closed by the server.',
                    '',
                    'You may have been idle for too long.',
                    'You may have a network problem.',
                    'You may have been ejected by vote.',
                    'You may have been freed by the captain in a clue game.',
                    'You may have been disconnected by the server owner.',
                    '',
                    'Technical data: read(2) returned zero on',
                    nt.diagnostics()]

        x = []
        s = ['Protocol version in CP_SOCKET is not supported by server.',
             'Access denied by server.',
             'No free slots on server queue.',
             'Banned from server.',
             'Game shutdown by server.',
             'Server daemon stalled, internal error.',
             'Server reports internal error.']

        # FIXME: how to contact a server owner, noted by Gerdesas, design as
        # either a new feature packet with sysdef text setting, or
        # default to first user@host in .motd if an old server.

        l = [['You have either connected to a server that does not support',
              'this client, or the server itself is insane.',
              '',
              'Try a different server,',
              'or report this to the server owner,',
              'or report this to the client developer.'],

             ['The server has your IP address, or a range of addresses, in a',
              'configuration file, due to a prior denial of service attack.',
              '',
              'Try a different server,',
              'or try a different service provider,',
              'or ask the server owner about it.'],

             ['The server was not able to place you in the queue, perhaps',
              'due to a denial of service attack happening right now.',
              '',
              'Or if you were in a clue game, the captain has freed your slot',
              'so that another player can join.',
              '',
              'Or in a pickup game the players ejected you.',
              '',
              'Try a different server,',
              'or rejoin as an observer of the clue game.'],

             ['The server has your IP address in the list of bans,',
              'usually because you were banned by the players or the owner.',
              '',
              'Try a different server,',
              'and if you were misbehaving try not to in future.'],

             ['The server was shutdown by the owner,',
              'probably only temporarily.',
              '',
              'Try a different server,',
              'or try this server later,',
              'or ask the server owner about it.']]

        try:
            x.append(s[sp_badversion.why])
        except:
            x.append('Unknown cause.')
        x.append('')
        try:
            for y in l[sp_badversion.why]:
                x.append(y)
        except:
            x.append('Try again later.')
        x.append('')
        x.append('Technical data: '
                 'received SP_BADVERSION packet, '
                 'reason code %d' % sp_badversion.why)
        return x

    def list(self, event):
        self.run = False

""" Main Program
"""

def mc_init():
    """ metaserver client socket initialisation """
    mc = MetaClient()
    # query metaserver early,
    # to make good use of pygame startup and splash delay
    mc.query(opt.metaserver)
    return mc

def nt_init():
    """ netrek client socket initialisation """
    nt = Client(sp)
    if opt.tcp_only:
        nt.mode_requested = COMM_TCP
    nt.cp_udp_req = cp_udp_req
    return nt

def pg_fd():
    """ lift the hood on pygame and find the file descriptor that it
    expects graphics events to arrive from, so that it can be used in
    select, contributed by coderanger on #pygame and #olpc-devel ...

    SDL_VideoDevice -> SDL_PrivateVideoData (is a pointer, way deep in
    the parent structure) -> X11_Display (is a pointer, offset after
    one prior int) . member fd (is an int, offset after two prior
    structure members, which are pointers).
    """
    try:
        w = pygame.display.get_wm_info()
        w = w['display']
        n = int(str(w)[23:-1], 16)
        n = ctypes.cast(n+8, ctypes.POINTER(ctypes.c_int)).contents.value
        n = ctypes.cast(n+8, ctypes.POINTER(ctypes.c_int)).contents.value
    except:
        print "unable to identify file descriptor of X socket, slowing"

        """

        The effect of this is profound, but usually only noticed by
        expert players firing bursts of torpedoes.

        The effect is input lag.

        Normally nt.recv will wake the process on either a network
        event or a display event.  Without a call to nt.set_pg_fd,
        nt.recv will stall until a packet arrives from the server,
        or a 0.04 second timeout expires.

        Therefore if the X socket descriptor cannot be identified, or
        in the case of non-X SDL usage, such as on Mac OS X or
        Microsoft Windows, the player will experience input lag, where
        response to keyboard or mouse events will be delayed by up to
        the 0.04 second timeout.

        Consider the two timing diagrams that follow.  These are
        timelines, with a scale of 0.002 seconds per character, with
        characters representing different things:

        External events:

                |  server update boundary at 10 updates (0.1 sec)
                <  packet from server (lagged by 6ms from server)
                e  keyboard or mouse event (from the player)

        Generated events:

                d  display update based on packet received from server
                >  packet to server based on keyboard or mouse event
                =  the 0.04 second timeout on select in nt.recv

        a.  Normal case, with X socket descriptor used by nt.recv

        0.0 sec                                           0.1 sec
        |                                                 |
        |   <      e                                      |   <
        |                                                 |
        |    d      >                                     |    d
        -------------------------------------------------------------

        b.  Abnormal case, with X socket descriptor unknown

        0.0 sec                                           0.1 sec
        |                                                 |
        |   <      e                                      |   <
        |===  ==================== ==================== ==|===  =====
        |    d                    >                       |    d
        -------------------------------------------------------------

        """
        return

    if n > 255:
        print "the fd was too large, abondoning that line of reasoning, just guessing"
        n = 4

    nt.set_pg_fd(n)
    if mc: mc.set_pg_fd(n)

def pg_init():
    """ pygame initialisation """
    global t_planets, t_players, t_torps, t_plasma, g_planets, g_players, g_locator, b_warning_sprite, b_warning, b_reports, b_message, b_info, background, galactic_factor, subgalactic_factor, r_main, r_us, r_sg

##     pygame.mixer.pre_init(44100, -16, 2, 1024)
    pygame.init()
    pygame.key.set_repeat(250, 100)
    size = width, height = 1000, 1000

##     def load_sound(name):
##         try:
##             sound = pygame.mixer.Sound(name)
##         except:
##             sound = pygame.mixer.Sound(os.path.join(opt.assets, name))
##         return sound

##     global sound_off
##     sound_off = load_sound('/tmp/off.ogg')
##     sound_off.play()

    videoinfo = pygame.display.Info()
    print "current display resolution is %d x %d pixels" % (videoinfo.current_w, videoinfo.current_h)

    screen = None
    undersize = (videoinfo.current_w < 1000 or videoinfo.current_h < 1000)

    # manual display size control using command line flags
    if opt.manual_width != None or opt.manual_height != None:
        print "you gave manual override for display size"
        manual_width = videoinfo.current_w
        if opt.manual_width != None:
            manual_width = opt.manual_width
        manual_height = videoinfo.current_h
        if opt.manual_height != None:
            manual_height = opt.manual_height
        if opt.fullscreen:
            screen = pygame.display.set_mode((manual_width, manual_height),
                                             FULLSCREEN)
        else:
            screen = pygame.display.set_mode((manual_width, manual_height))
        undersize = False

    # choose a display resolution or display window size in priority
    # order

    # 1. try the best resolution for game design, but only if the
    # current resolution is undersize

    if not screen and undersize:
        print "trying best resolution for game"
        try:
            screen = pygame.display.set_mode((1000, 1000), FULLSCREEN)
            undersize = False
        except:
            print "could not switch display resolution"

    # 2. try the standard resolution just above our best resolution
    # for game design, but only if the current resolution is
    # undersize, and if the previous resolution failed.

    if not screen and undersize:
        print "trying a standard resolution above best for game"
        try:
            screen = pygame.display.set_mode((1280, 1024), FULLSCREEN)
            undersize = False
        except:
            print "could not switch display resolution"

    # 3. try the standard resolution just below our best resolution
    # for game design, but only if the current resolution is
    # undersize, and if the previous resolution failed.

    if not screen and undersize:
        print "trying a standard resolution below best for game"
        try:
            screen = pygame.display.set_mode((1024, 768), FULLSCREEN)
        except:
            print "could not switch display resolution"

    # 4. try the current resolution in full screen mode, but only if
    # the above didn't work, and only if the user asked for full
    # screen mode.

    if not screen and opt.fullscreen:
        if videoinfo.current_w != -1 and videoinfo.current_h != -1:
            print "trying current resolution in full screen mode"
            screen = pygame.display.set_mode((videoinfo.current_w,
                                              videoinfo.current_h), FULLSCREEN)

    # 5. try the current resolution ... probably suboptimal, to be
    # refined.

    if not screen:
        screen = pygame.display.set_mode()

    surface = pygame.display.get_surface()
    width = surface.get_width()
    height = surface.get_height()
    size = width, height
    print "have a surface size %d x %d pixels" % (width, height)
    r_main = Rect((0, 0), (width, height))
    r_us = r_main
    if width > 1000 and height > 1000:
        left = (width - 1000) / 2
        top = (height - 1000) / 2
        r_us = Rect((left, top), (1000, 1000))

    short = min(r_us.width, r_us.height)
    galactic_factor = GWIDTH / short

    gap = 50  # gap between tactical edge and subgalactic edge
    dia = 200  # size of subgalactic
    r_sg = Rect((r_us.left+gap, r_us.bottom-gap-dia), (dia, dia))
    subgalactic_factor = GWIDTH / dia

    # sprite groups,
    # prefix { t_ for tactical, g_ for galactic, b_ for both, }
    # sprites for planets, players, torps, plasma, each add themselves
    # to the groups when they wish to assert visibility.
    t_planets = pygame.sprite.OrderedUpdates(())
    t_players = pygame.sprite.OrderedUpdates(())
    t_torps = pygame.sprite.OrderedUpdates(())
    t_plasma = pygame.sprite.OrderedUpdates(())
    g_locator = pygame.sprite.OrderedUpdates(())
    g_locator.add(LocatorSprite())
    g_planets = pygame.sprite.OrderedUpdates(())
    g_players = pygame.sprite.OrderedUpdates(())
    b_warning = pygame.sprite.OrderedUpdates()
    b_warning_sprite = WarningSprite()
    b_warning.add(b_warning_sprite)
    b_reports = pygame.sprite.OrderedUpdates()
    b_reports.add(ReportSprite())
    if opt.debug:
        b_reports.add(DebugSprite())
    b_message = pygame.sprite.OrderedUpdates()
    b_message.add(MessageSprite())
    b_info = pygame.sprite.OrderedUpdates()

    background = screen.copy()
    background.fill((0, 0, 0))
    screen.blit(background, (0, 0))
    # FIXME: allow user to select graphics theme, default on XO is to
    # be white with oysters, otherwise use stars, planets, and ships.
    pygame.display.flip()
    return screen

def pg_quit():
    """ pygame termination """
    pygame.display.quit()
    pygame.quit()

def mc_choose():
    ph_servers = PhaseServers(screen, mc)
    while ph_servers.cancelled:
        del ph_servers
        ph_tips = PhaseTips(screen)
        mc.query(opt.metaserver)
        ph_servers = PhaseServers(screen, mc)

def mc_choose_first():
    """ show splash screen, then server list, accept a choice, connect """
    ph_splash = PhaseSplash(screen)
    mc_choose()

def mc_choose_again():
    """ requery metaserver, show server list, accept a choice, connect """
    mc.query(opt.metaserver)
    mc_choose()

def nt_play_a_slot():
    """ keep playing on a server, until user chooses a quit option, or
    a list option to return to the server list """
    global ph_flight, ph_galactic, ph_tactical

    ph_outfit = PhaseOutfit(screen)
    ph_galactic = PhaseFlightGalactic()
    ph_tactical = PhaseFlightTactical()

    while True:
        # choose a team and ship
        ph_outfit.do()
        if ph_outfit.cancelled: break # quit or list chosen during outfit
        # at this point, team and ship choice is accepted by server

        # FIXME: here we utterly rely on arriving network packets
        # until ship status changes (SP_PSTATUS), and we don't do any
        # screen updates, and we don't notice if the stream falters.
        while me.status == POUTFIT: nt.recv()

        ph_flight = ph_tactical
        if not ph_tactical.hint():
            if me.flags & PFGREEN:
                ph_tactical.tips()
        while True:
            # clear screen before starting a display mode
            screen.blit(background, (0, 0))
            # FIXME: might place display mode independent static
            # content on screen here, or not clear the whole screen
            pygame.display.flip()
            ph_flight.do()
            if me.status == POUTFIT: break # ship has died

def nt_play():
    """ keep playing, until user chooses a quit option """
    if opt.server == None: mc_choose_first()
    while True:
        # at this point, a new connection to a server has just been established
        try:
            nt.send(cp_socket.data())
            nt.send(cp_feature.data('S', 0, 0, 1, 'FEATURE_PACKETS'))
            # FIXME: allow play on another server while queued
            ph_queue = PhaseQueue(screen)
            if ph_queue.cancelled:
                if mc == None: break
                # return to metaserver list
                mc_choose_again()
                continue

            if opt.name == '':
                ph_login = PhaseLogin(screen)
                if ph_login.cancelled:
                    if mc == None: break
                    # return to metaserver list
                    mc_choose_again()
                    continue

            nt_play_a_slot()

        except ServerDisconnectedError:
            PhaseDisconnected(screen)

        if mc == None: break

        # return to metaserver list
        mc_choose_again()

def main(argv=sys.argv[1:]):
    global opt, screen, mc, nt

    for line in WELCOME: print line
    print

    opt, args = options.parser.parse_args(argv)
    if opt.ubertweak:
        import getpass
        opt.name = opt.password = opt.login = getpass.getuser()

    mc = None
    if opt.server == None: mc = mc_init()
    nt = nt_init()
    if opt.server != None:
        opt.chosen = opt.server
        if not nt.connect(opt.chosen, opt.port):
            print "connection failed"
            # server was requested on command line, but not available
            return 1
    screen = pg_init()
    pg_fd()

    nt_play()
    if opt.debug:
        ic.statistics()
    pg_quit()
    return 0

# FIXME: planets to be partial alpha in tactical view as ships close in?

# FIXME: add graphic indicator of connection status
# FIXME: discover servers from a cache

# FIXME: when other slot frees, free all torps

# FIXME: add a help aka documentation button on metaserver list, also
# accessible from other modes but will force a disconnection from
# server, to contain tutorial, ship classes, and rank information.

# FIXME: mouse-over hint for word "clue", explain terms (says Petria)

# FIXME: list buttons do not show server list if --server used, avoid
# rendering them.

# FIXME: new version notification

# FIXME: explanation of how to get an account on a netrek server

# FIXME: configuration settings, store in a YAML

# FIXME: dual display

# FIXME: keymap feature, allow use of function keys for actions.

# FIXME: dashboard should show percentages or proportions, per petria
