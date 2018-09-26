/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.
	https://github.com/hebcal/hebcal-js
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
	Danny Sadinoff can be reached at danny@sadinoff.com
	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.
	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
 */
const gematriya = require("gematriya");
const c = require("./common");

const HDate = require("./hdate");

const __cache = {};

// for byte optimizations

const dayOnOrBefore = c.dayOnOrBefore;

const months = c.months;

const days = c.days;

const TISHREI = months.TISHREI;

const KISLEV = months.KISLEV;

const NISAN = months.NISAN;

const SAT = days.SAT;

const getDay = "getDay";

const abs = "abs";

const Shabbat = "Shabbat";

const Shabbos = "Shabbos";

function Chanukah(day) {
    return [`חנוכה: נר ${gematriya(day)}`];
}

function CHM(desc) {
    return [desc[0] ? `${desc[0]} )חה"ם(` : desc[2]];
}

function Sukkot(day) {
    return [`סוכות יום ${gematriya(day)}`];
}

function Pesach(day) {
    return [`פסח יום ${gematriya(day)}`];
}

const USER_EVENT = 1;

const LIGHT_CANDLES = 2;

const YOM_TOV_ENDS = 4;

const CHUL_ONLY = 8;
// chutz l'aretz (Diaspora)

const IL_ONLY = 16;
// b'aretz (Israel)

const LIGHT_CANDLES_TZEIS = 32;

const VACATION = 64;

exports.masks = {
    USER_EVENT,
    LIGHT_CANDLES,
    YOM_TOV_ENDS,
    CHUL_ONLY,
    IL_ONLY,
    LIGHT_CANDLES_TZEIS,
    VACATION
};

function Event(date, desc, mask, id) {
    const me = this;
    me.date = new HDate(date);
    me.desc = typeof desc !== "object" ? [desc] : desc;
    me.id = id;

    me.USER_EVENT = !!(mask & USER_EVENT);
    me.LIGHT_CANDLES = !!(mask & LIGHT_CANDLES);
    me.YOM_TOV_ENDS = !!(mask & YOM_TOV_ENDS);
    me.CHUL_ONLY = !!(mask & CHUL_ONLY);
    me.IL_ONLY = !!(mask & IL_ONLY);
    me.LIGHT_CANDLES_TZEIS = !!(mask & LIGHT_CANDLES_TZEIS);
    me.VACATION = !!(mask & VACATION);
}

Event.prototype.is = function(date, il) {
    date = new HDate(date);
    let myDate = this.date;
    if (arguments.length < 2) {
        // il = Event.isIL;
        il = date.il;
    }
    if (
        date.getDate() != myDate.getDate() ||
        date.getMonth() != myDate.getMonth()
    ) {
        return false;
    }
    if (date.getFullYear() != myDate.getFullYear()) {
        return false;
    }
    if ((il && this.CHUL_ONLY) || (!il && this.IL_ONLY)) {
        return false;
    }
    return true;
};

Event.prototype.masks = function() {
    const me = this;
    return (
        (me.USER_EVENT && USER_EVENT) |
        (me.LIGHT_CANDLES && LIGHT_CANDLES) |
        (me.YOM_TOV_ENDS && YOM_TOV_ENDS) |
        (me.CHUL_ONLY && CHUL_ONLY) |
        (me.IL_ONLY && IL_ONLY) |
        (me.LIGHT_CANDLES_TZEIS && LIGHT_CANDLES_TZEIS) |
        (me.VACATION && VACATION)
    );
};

Event.prototype.getDesc = function(o) {
    return c.LANG(this.desc, o);
};

Event.prototype.candleLighting = function() {
    const date = this.date;
    if (this.LIGHT_CANDLES) {
        return new Date(date.sunset() - Event.candleLighting * 60 * 1000);
    }
    if (this.LIGHT_CANDLES_TZEIS) {
        return date.getZemanim().tzeit;
    }
    return null;
};

Event.prototype.havdalah = function() {
    if (this.YOM_TOV_ENDS) {
        return new Date(
            this.date.sunset().getTime() + Event.havdalah * 60 * 1000
        );
    }
    return null;
};

Event.prototype.routine = (function() {
    function routine() {
        return !!~routine.names.indexOf(this.getDesc("s"));
    }
    routine.names = [Shabbat, `Erev ${Shabbat}`];
    return routine;
})();

Event.isIL = false;

Event.candleLighting = 18;

Event.havdalah = 42;

exports.Event = Event;

exports.year = function(year) {
    if (__cache[year]) {
        return __cache[year];
    }

    const RH = new HDate(1, TISHREI, year);

    const pesach = new HDate(15, NISAN, year);

    let tmpDate;

    const h = {};

    function add(ev) {
        if (Array.isArray(ev)) {
            ev.forEach(e => {
                add(e);
            });
        } else if (h[ev.date]) {
            h[ev.date].push(ev);
        } else {
            h[ev.date] = [ev];
        }
    }

    Object.defineProperty(h, "add", { value: add });

    add([
        // standard holidays that don't shift based on year
        new Event(
            RH,
            ["ראש השנה א'"],
            LIGHT_CANDLES_TZEIS | VACATION,
            "ראש השנה"
        ),
        new Event(
            new HDate(2, TISHREI, year),
            ["ראש השנה ב'"],
            YOM_TOV_ENDS | VACATION,
            "ראש השנה"
        ),
        new Event(
            new HDate(3 + (RH[getDay]() == days.THU), TISHREI, year), // push off to SUN if RH is THU
            ["צום גדליה"],
            VACATION,
            "ראש השנה"
        ),
        new Event(
            new HDate(9, TISHREI, year),
            ["ערב יום כיפור"],
            LIGHT_CANDLES | VACATION,
            "יום כיפור"
        ),
        new Event( // first SAT after RH
            new HDate(dayOnOrBefore(SAT, 7 + RH[abs]())),
            ["שבת שובה"],
            0
        ),
        new Event(
            new HDate(10, TISHREI, year),
            ["יום כיפור"],
            YOM_TOV_ENDS | VACATION,
            "יום כיפור"
        ),
        new Event(
            new HDate(14, TISHREI, year),
            ["ערב סוכות"],
            LIGHT_CANDLES | VACATION,
            "סוכות"
        ),
        new Event(
            new HDate(15, TISHREI, year),
            Sukkot(1),
            LIGHT_CANDLES_TZEIS | CHUL_ONLY | VACATION,
            "סוכות"
        ),
        new Event(
            new HDate(15, TISHREI, year),
            Sukkot(1),
            YOM_TOV_ENDS | IL_ONLY
        ),
        new Event(
            new HDate(16, TISHREI, year),
            Sukkot(2),
            YOM_TOV_ENDS | CHUL_ONLY
        ),
        new Event(new HDate(16, TISHREI, year), CHM(Sukkot(2)), IL_ONLY),
        new Event(new HDate(17, TISHREI, year), CHM(Sukkot(3)), 0),
        new Event(new HDate(18, TISHREI, year), CHM(Sukkot(4)), 0),
        new Event(new HDate(19, TISHREI, year), CHM(Sukkot(5)), 0),
        new Event(new HDate(20, TISHREI, year), CHM(Sukkot(6)), 0),
        new Event(
            new HDate(21, TISHREI, year),
            ["סוכות יום ז' )הושנע רבה("],
            LIGHT_CANDLES | VACATION,
            "סוכות"
        ),
        new Event(
            new HDate(22, TISHREI, year),
            ["שמיני עצרת"],
            LIGHT_CANDLES_TZEIS | CHUL_ONLY
        ),
        new Event(
            new HDate(22, TISHREI, year),
            ["שמיני עצרת / שמחת תורה"],
            YOM_TOV_ENDS | IL_ONLY | VACATION,
            "סוכות"
        ),
        new Event(
            new HDate(23, TISHREI, year),
            ["שמחת תורה"],
            YOM_TOV_ENDS | CHUL_ONLY
        ),
        new Event(new HDate(24, KISLEV, year), ["ערב חנוכה"], 0),
        new Event(new HDate(25, KISLEV, year), Chanukah(1), 0),
        new Event(new HDate(26, KISLEV, year), Chanukah(2), 0),
        new Event(new HDate(27, KISLEV, year), Chanukah(3), 0),
        new Event(new HDate(28, KISLEV, year), Chanukah(4), 0),
        new Event(new HDate(29, KISLEV, year), Chanukah(5), 0),
        new Event(
            new HDate(30, KISLEV, year), // yes, i know these are wrong
            Chanukah(6),
            0
        ),
        new Event(
            new HDate(31, KISLEV, year), // HDate() corrects the month automatically
            Chanukah(7),
            0
        ),
        new Event(new HDate(32, KISLEV, year), Chanukah(8), 0),
        new Event(new HDate(15, months.SHVAT, year), ['ט"ו בשבט'], 0),
        new Event(
            new HDate(dayOnOrBefore(SAT, pesach[abs]() - 43)),
            ["שבת שקלים"],
            0
        ),
        new Event(
            new HDate(dayOnOrBefore(SAT, pesach[abs]() - 30)),
            ["שבת זכור"],
            0
        ),
        new Event(
            new HDate(pesach[abs]() - (pesach[getDay]() == days.TUE ? 33 : 31)),
            ["תענית אסתר"],
            0
        ),
        new Event(new HDate(13, months.ADAR_II, year), ["ערב פורים"], 0),
        new Event(new HDate(14, months.ADAR_II, year), ["פורים"], 0),
        new Event(new HDate(15, months.ADAR_II, year), ["שושן פורים"], 0),
        new Event(
            new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14) - 7),
            ["שבת פרה"],
            0
        ),
        new Event(
            new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14)),
            ["שבת החודש"],
            0
        ),
        new Event(
            new HDate(dayOnOrBefore(SAT, pesach[abs]() - 1)),
            ["שבת הגדול"],
            0
        ),
        new Event(
            // if the fast falls on Shabbat, move to Thursday
            pesach.prev()[getDay]() == SAT
                ? pesach.onOrBefore(days.THU)
                : new HDate(14, NISAN, year),
            ["תענית בכורות"],
            0
        ),
        new Event(
            new HDate(14, NISAN, year),
            ["ערב פסח"],
            LIGHT_CANDLES | VACATION,
            "פסח"
        ),
        new Event(
            new HDate(15, NISAN, year),
            Pesach(1),
            LIGHT_CANDLES_TZEIS | CHUL_ONLY | VACATION,
            "פסח"
        ),
        new Event(
            new HDate(15, NISAN, year),
            Pesach(1),
            YOM_TOV_ENDS | IL_ONLY
        ),
        new Event(
            new HDate(16, NISAN, year),
            Pesach(2),
            YOM_TOV_ENDS | CHUL_ONLY
        ),
        new Event(new HDate(16, NISAN, year), CHM(Pesach(2)), IL_ONLY),
        new Event(new HDate(16, NISAN, year), ["התחלת ספירת העומר"], 0),
        new Event(new HDate(17, NISAN, year), CHM(Pesach(3)), 0),
        new Event(new HDate(18, NISAN, year), CHM(Pesach(4)), 0),
        new Event(new HDate(19, NISAN, year), CHM(Pesach(5)), 0),
        new Event(new HDate(20, NISAN, year), CHM(Pesach(6)), LIGHT_CANDLES),
        new Event(
            new HDate(21, NISAN, year),
            Pesach(7),
            LIGHT_CANDLES_TZEIS | CHUL_ONLY
        ),
        new Event(
            new HDate(21, NISAN, year),
            Pesach(7),
            YOM_TOV_ENDS | IL_ONLY | VACATION,
            "פסח"
        ),
        new Event(
            new HDate(22, NISAN, year),
            Pesach(8),
            YOM_TOV_ENDS | CHUL_ONLY | VACATION,
            "פסח"
        ),
        new Event(new HDate(14, months.IYYAR, year), ["פסח שני"], 0),
        new Event(new HDate(18, months.IYYAR, year), ['ל"ג בעומר'], 0),
        new Event(
            new HDate(5, months.SIVAN, year),
            ["ערב שבועות"],
            LIGHT_CANDLES | VACATION,
            "שבועות"
        ),
        new Event(
            new HDate(6, months.SIVAN, year),
            ["שבועות א'"],
            LIGHT_CANDLES_TZEIS | CHUL_ONLY | VACATION,
            "שבועות"
        ),
        new Event(
            new HDate(6, months.SIVAN, year),
            ["שבועות"],
            YOM_TOV_ENDS | IL_ONLY
        ),
        new Event(
            new HDate(7, months.SIVAN, year),
            ["שבועות ב'"],
            YOM_TOV_ENDS | CHUL_ONLY
        ),
        new Event(
            new HDate(
                dayOnOrBefore(SAT, new HDate(1, TISHREI, year + 1)[abs]() - 4)
            ),
            ["ליל סליחות"],
            0
        ),
        new Event(
            new HDate(29, months.ELUL, year),
            ["ערב ראש השנה"],
            LIGHT_CANDLES
        )
    ]);

    tmpDate = new HDate(10, months.TEVET, year);
    if (tmpDate[getDay]() == SAT) {
        tmpDate = tmpDate.next();
    }
    add(new Event(tmpDate, ["עשרה בטבת"], 0));

    if (c.LEAP(year)) {
        add(new Event(new HDate(14, months.ADAR_I, year), ["פורים קטן"], 0));

        add(
            new Event(new HDate(15, months.ADAR_I, year), ["שושן פורים קטן"], 0)
        );
    }

    if (year >= 5711) {
        // Yom HaShoah first observed in 1951
        tmpDate = new HDate(27, NISAN, year);
        /* When the actual date of Yom Hashoah falls on a Friday, the
		 * state of Israel observes Yom Hashoah on the preceding
		 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
		 * on the following Monday.
		 * http://www.ushmm.org/remembrance/dor/calendar/
		 */

        if (tmpDate[getDay]() == days.FRI) {
            tmpDate = tmpDate.prev();
        } else if (tmpDate[getDay]() == days.SUN) {
            tmpDate = tmpDate.next();
        }

        add(new Event(tmpDate, ["יום השואה"], 0));
    }

    add(atzmaut(year));

    if (year >= 5727) {
        // Yom Yerushalayim only celebrated after 1967
        add(new Event(new HDate(29, months.IYYAR, year), ["יום ירושלים"], 0));
    }

    tmpDate = new HDate(17, months.TAMUZ, year);
    if (tmpDate[getDay]() == SAT) {
        tmpDate = tmpDate.next();
    }
    add(new Event(tmpDate, ["צום יז' בתמוז"], 0));

    tmpDate = new HDate(9, months.AV, year);
    if (tmpDate[getDay]() == SAT) {
        tmpDate = tmpDate.next();
    }

    add(
        new Event(
            new HDate(dayOnOrBefore(SAT, tmpDate[abs]())),
            ["שבת חזון"],
            0
        )
    );

    add(new Event(tmpDate.prev(), ["ערב תשעה באב"], 0));

    add(new Event(tmpDate, ["תשעה באב"], 0));

    add(
        new Event(
            new HDate(dayOnOrBefore(SAT, tmpDate[abs]() + 7)),
            ["שבת נחמו"],
            0
        )
    );

    for (let day = 6; day < c.daysInYear(year); day += 7) {
        add(
            new Event(
                new HDate(
                    dayOnOrBefore(SAT, new HDate(1, TISHREI, year)[abs]() + day)
                ),
                ["שבת"],
                YOM_TOV_ENDS
            )
        );

        add(
            new Event(
                new HDate(
                    dayOnOrBefore(
                        days.FRI,
                        new HDate(1, TISHREI, year)[abs]() + day
                    )
                ),
                ["ערב שבת"],
                LIGHT_CANDLES
            )
        );
    }

    for (let month = 1; month <= c.MONTH_CNT(year); month++) {
        if (
            (month == NISAN
                ? c.daysInMonth(c.MONTH_CNT(year - 1), year - 1)
                : c.daysInMonth(month - 1, year)) == 30
        ) {
            add(new Event(new HDate(1, month, year), ["ראש חודש ב'"], 0));

            add(new Event(new HDate(30, month - 1, year), ["ראש חודש א'"], 0));
        } else if (month !== TISHREI) {
            add(new Event(new HDate(1, month, year), ["ראש חודש"], 0));
        }

        if (month == months.ELUL) {
            continue;
        }

        add(
            new Event(
                new HDate(29, month, year).onOrBefore(SAT),
                ["שבת מברכים"],
                0
            )
        );
    }

    return (__cache[year] = h);
};

function atzmaut(year) {
    if (year >= 5708) {
        // Yom HaAtzma'ut only celebrated after 1948
        const tmpDate = new HDate(1, months.IYYAR, year);

        const pesach = new HDate(15, NISAN, year);

        if (pesach[getDay]() == days.SUN) {
            tmpDate.setDate(2);
        } else if (pesach[getDay]() == SAT) {
            tmpDate.setDate(3);
        } else if (year < 5764) {
            tmpDate.setDate(4);
        } else if (pesach[getDay]() == days.TUE) {
            tmpDate.setDate(5);
        } else {
            tmpDate.setDate(4);
        }

        return [
            new Event(tmpDate, ["יום הזיכרון"], VACATION, "עצמאות"),
            new Event(tmpDate.next(), ["יום העצמאות"], VACATION, "עצמאות")
        ];
    }
    return [];
}
exports.atzmaut = atzmaut;
