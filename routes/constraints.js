const express = require("express");
const Moment = require("moment");
const MomentRange = require("moment-range");
const _ = require("lodash");
const db = require("../db/db");
const uc = require("../userConstraints");
const getHolidays = require("../client/src/holidays");

const userConstraints = uc.constraints(db);

const moment = MomentRange.extendMoment(Moment);
const table = "Constraints";
const populate = ["groups"];
const router = express.Router();

class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = "TimeoutError";
    }
}

const median = array => {
    const sortedArray = array.sort((x, y) => x - y);
    const halfLength = parseInt(sortedArray.length / 2);
    if (sortedArray.length % 2 === 0) {
        // array with even number elements
        return (sortedArray[halfLength] + sortedArray[halfLength - 1]) / 2;
    }

    return sortedArray[halfLength]; // array with odd number elements
};

const product = arr => {
    if (arr.length === 0) {
        return [];
    }
    if (arr.length === 1) {
        return arr[0].length > 0 ? arr[0] : [undefined];
    }

    const result = [];
    const allCasesOfRest = product(arr.slice(1)); // recur with the rest of array
    allCasesOfRest.forEach(rest => {
        if (arr[0].length === 0) {
            result.push(_.concat(undefined, rest));
        } else {
            for (let i = 0; i < arr[0].length; i += 1) {
                result.push(_.concat(arr[0][i], rest));
            }
        }
    });
    return result;
};

const isHoliday = (day, location, holidays) =>
    holidays[moment(day).format("D/M/Y")] &&
    holidays[moment(day).format("D/M/Y")].filter(h => h.location === location)
        .length > 0;

const getPreviousScheduleThisWeek = (
    shift,
    day,
    sofar,
    holidays,
    constraints
) => {
    for (let i = 6; i >= 0 /* day.day() */; i -= 1) {
        const ans = (sofar[moment(day).day(i)] || []).find(
            s => s.shift._id.toString() === shift._id.toString()
        );
        // filter users that were in same holiday last year (if today is a holiday)
        const splitHolidayConstraints = constraints.filter(
            c => c.type === "holidaySplit"
        );
        if (ans && splitHolidayConstraints.length > 0) {
            const groups = _.concat(
                ...splitHolidayConstraints.map(c => c.groups)
            );
            if (!uc.userInGroups(ans.user, groups)) {
                holidays = [];
            }
        }
        if (
            ans &&
            isHoliday(ans.date, ans.user.location, holidays) ===
                isHoliday(day, ans.user.location, holidays)
        ) {
            return ans;
        }
    }
    return undefined;
};

const getPreviousUsersThisWeek = (shift, day, sofar) => {
    const users = [];
    for (let i = 0; i < 7 /* day.day() */; i += 1) {
        (sofar[moment(day).day(i)] || [])
            .filter(s => s.shift._id.toString() !== shift._id.toString())
            .forEach(sc => users.push(sc.user._id.toString()));
    }
    return _.uniq(users);
};
/**
 * Calculates the list of possible users for supplied shift in supplied day taking into account schedules so far
 * @param {*} shift the shift
 * @param {*} day the day
 * @param {*} sofar schedules so far in the month
 */
const getPossibleUsers = (
    shift,
    day,
    sofar,
    users,
    constraints,
    events,
    holidays,
    schedules,
    lastyearholidayschedules
) => {
    let possible = users.filter(u => u.groups.indexOf(shift.group._id) !== -1); // All possible users for this shifts group
    if (possible.length === 0) {
        return [];
    }
    console.log(`Starting with full users: ${JSON.stringify(possible.map(u => u.name))}`)
    const exists = schedules.find(
        sc => sc.shift._id.toString() === shift._id.toString()
    );
    if (exists) {
        // A schedule already exists for this shift so we need to choose the same user
        possible = [exists.user];
        console.log(`Schedule exists so picking: ${JSON.stringify(possible.map(u => u.name))}`)
    } else {
        const previousschedule = getPreviousScheduleThisWeek(
            shift,
            day,
            sofar,
            holidays,
            constraints
        );
        if (previousschedule) {
            // A schedule already exists for this shift previously this week
            possible = [previousschedule.user];
            console.log(`Previous schedule exists so picking: ${JSON.stringify(possible.map(u => u.name))}`)
        }
    }

    // ************** Start filtering the users ************************* Filter
    // users who already have a shift this week other than this one
    const notSameWeekConstraints = constraints.filter(
        c => c.type === "notSameWeek"
    );
    if (notSameWeekConstraints.length > 0) {
        const groups = _.concat(...notSameWeekConstraints.map(c => c.groups));
        const previoususers = getPreviousUsersThisWeek(shift, day, sofar);
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                previoususers.indexOf(u._id.toString()) === -1
        );
    }
    if (possible.length === 0) {
        console.log(`Fell on not same week`);
        return [];
    }
    console.log(`Remaining after notSameWeek: ${JSON.stringify(possible.map(u => u.name))}`)
    // filter users that already have a schedule today
    const todayusers = (sofar[day] || []).map(schedule =>
        schedule.user._id.toString()
    );
    possible = possible.filter(
        u => todayusers.indexOf(u._id.toString()) === -1
    );
    if (possible.length === 0) {
        return [];
    }
    console.log(`Remaining after todayusers: ${JSON.stringify(possible.map(u => u.name))}`)
    // filter users that are on vacation today
    const notOnUnavailabilityConstraints = constraints.filter(
        c => c.type === "notOnUnavailability"
    );
    if (notOnUnavailabilityConstraints.length > 0) {
        const groups = _.concat(
            ...notOnUnavailabilityConstraints.map(c => c.groups)
        );
        // filter list of users to those that either don't belong in constraint groups
        // or don't have any event today
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                !events.find(
                    e =>
                        e.type === "Unavailability" &&
                        moment(e.date).isSame(day) &&
                        e.user._id.toString() === u._id.toString()
                )
        );
    }
    if (possible.length === 0) {
        console.log(`Fell on unavailability`);
        return [];
    }
    console.log(`Remaining after notOnUnavailability: ${JSON.stringify(possible.map(u => u.name))}`)
    // filter users that were in same holiday last year (if today is a holiday)
    const notConecutiveHolidayConstraints = constraints.filter(
        c => c.type === "notConecutiveHoliday"
    );
    if (notConecutiveHolidayConstraints.length > 0) {
        const groups = _.concat(
            ...notConecutiveHolidayConstraints.map(c => c.groups)
        );
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                !holidays[moment(day).format("D/M/Y")] ||
                holidays[moment(day).format("D/M/Y")].filter(
                    h => h.location === u.location
                ).length === 0 ||
                !holidays[moment(day).format("D/M/Y")]
                    .filter(h => h.location === u.location)
                    .find(
                        holiday =>
                            lastyearholidayschedules[holiday.id] &&
                            lastyearholidayschedules[holiday.id].find(
                                uu => uu !== null && uu._id.toString() === u._id.toString()
                            )
                    )
        );
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                !events[day] ||
                events[day].filter(e => e.type === "Holiday").length === 0 ||
                !events[day]
                    .filter(e => e.type === "Holiday")
                    .find(
                        holiday =>
                            lastyearholidayschedules[holiday.id] &&
                            lastyearholidayschedules[holiday.id].find(
                                uu => uu._id.toString() === u._id.toString()
                            )
                    )
        );
    }
    if (possible.length === 0) {
        console.log(`Fell on consecutive holiday`);
        return [];
    }
    console.log(`Remaining after notConecutiveHoliday: ${JSON.stringify(possible.map(u => u.name))}`)
    // filter users that were in a shift last week
    const notConsecutiveWeekConstraints = constraints.filter(
        c => c.type === "notConsecutiveWeek"
    );
    if (notConsecutiveWeekConstraints.length > 0) {
        const groups = _.concat(
            ...notConsecutiveWeekConstraints.map(c => c.groups)
        );
        const userslastweek = _.uniq(
            _.concat(
                ...Array.from(
                    moment
                        .range(
                            moment(day)
                                .subtract(2, "weeks")
                                .startOf("week"),
                            moment(day)
                                .subtract(1, "weeks")
                                .endOf("week")
                        )
                        .by("day")
                ).map(d =>
                    (sofar[d] || [])
                        .map(schedule => schedule.user)
                        .filter(u => uc.userInGroups(u, groups))
                        .map(u => u._id.toString())
                )
            )
        );
        possible = possible.filter(
            u => userslastweek.indexOf(u._id.toString()) === -1
        );
    }
    if (possible.length === 0) {
        console.log(`Fell on consecutive week`);
        return [];
    }
    console.log(`Remaining after notConsecutiveWeek: ${JSON.stringify(possible.map(u => u.name))}`)
    // Check fairness of sofar (i.e. all schedules suggested up to now)
    const leastUsedUserConstraints = constraints.filter(
        c => c.type === "leastUsedUser"
    );
    if (leastUsedUserConstraints.length > 0) {
        const groups = _.concat(...leastUsedUserConstraints.map(c => c.groups));
        const histogram = possible
            .filter(u => uc.userInGroups(u, groups))
            .reduce((map, user) => {
                map[user._id.toString()] = 0;
                return map;
            }, {});
        Object.values(sofar).forEach(d => {
            d.forEach(schedule => {
                if (schedule.user !== null) {
                    const id = schedule.user._id.toString();
                    if (id in histogram) {
                        histogram[id] += schedule.shift.weight;
                    }
                }
            });
        });
        const med = median(Object.values(histogram));
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                histogram[u._id.toString()] <= med
        );
    }

    if (possible.length === 0) {
        console.log(`Fell on fairness`);
        return [];
    }
    console.log(`Remaining after leastUsedUser: ${JSON.stringify(possible.map(u => u.name))}`)
    // I want to sort all users by the weekday/weekends they've done
    const histogram = possible.reduce((map, user) => {
        map[user.name] = 0;
        return map;
    }, {});

    Object.values(sofar).forEach(d => {
        d
        // .filter(schedule => {
        //     if (day.day() < 5) {
        //         // Weekday
        //         return moment(schedule.date).day() < 5;
        //     }
        //     // Weekend
        //     return moment(schedule.date).day() >= 5;
        // })
        .forEach(schedule => {
            if (schedule.user !== null && schedule.user.name in histogram) {
                histogram[schedule.user.name] += schedule.shift.weight;
            }
        });
    });
    return Object.keys(histogram)
        .sort((a, b) => histogram[a] - histogram[b])
        .map(name => possible.find(u => u.name === name));
};

// This is the recursive method that advances shift by shift, day by day and
// calculates all possible users. Once it reaches the last day, it performs
// final filtering and returns a result
const rec = (
    day,
    sofar,
    shifts,
    users,
    constraints,
    events,
    holidays,
    schedules,
    lastyearholidayschedules,
    end,
    start
) => {
    // Limit the calculation to 10s. More than that is possibly a too big
    // calculation to complete in a reasonable time
    // if (new Date().getTime() - start.getTime() > 30000) {
    //    throw new TimeoutError();
    // }
    console.log(day.format("D/M/Y"));
    // Get first shift for this day that hasn't been filled already
    const shift = shifts.filter(
        s =>
            s.days.indexOf(day.day()) !== -1 &&
            (sofar[day] || []).filter(
                schedule => schedule.shift._id.toString() === s._id.toString()
            ).length === 0
    )[0];
    if (!shift) {
        // No free shift today?
        if (moment(day).isSame(end)) {
            // we've reached the end of the month
            return sofar;
        }
        // Possibly no shift today or filled all shifts so move on to the next
        return rec(
            moment(day).add(1, "days"),
            sofar,
            shifts,
            users,
            constraints,
            events,
            holidays,
            schedules,
            lastyearholidayschedules,
            end,
            start
        );
    }
    /* eslint-disable no-restricted-syntax */
    for (const user of getPossibleUsers(
        shift,
        day,
        sofar,
        users,
        constraints,
        events,
        holidays,
        schedules[day] || [],
        lastyearholidayschedules
    )) {
        // try this user with next recursion
        const p = rec(
            day,
            {
                ...sofar,
                [day]: [
                    ...(sofar[day] || []),
                    {
                        user,
                        shift,
                        date: day
                    }
                ]
            },
            shifts,
            users,
            constraints,
            events,
            holidays,
            schedules,
            lastyearholidayschedules,
            end,
            start
        );
        if (p) {
            // This user works
            return _.flatMap(p);
        }
    }
    /* eslint-enable */
};

router.get("/types", (req, res, next) => res.json(userConstraints));
router.post("/autopopulate", async (req, res, next) => {
    const { m = moment() } = req.body;
    const allexisting = await uc.getAllSchedulesInRangeByDay(m, db); // a list by day of all schedules or exceptions if any
    const copy = {};
    for (const i in allexisting) {
        copy[moment(i).valueOf()] = allexisting[i];
    }
    const begin = moment
        .utc(m)
        .startOf("month")
        .startOf("week");
    const end = moment
        .utc(m)
        .endOf("month")
        .endOf("week")
        .startOf("day");
    const events = await db.find("Events", {
        date: {
            $gte: begin,
            $lte: end
        }
    });
    const constraints = await db.find("Constraints", { enabled: true });
    const users = _.shuffle(await db.find("Users", { enabled: true })); // shuffle to return different possibility each time
    const shifts = await db.find(
        "Shifts",
        {
            enabled: true,
            group: {
                $exists: true
            }
        },
        ["group"]
    );
    const holidays = await getHolidays();
    events.filter(e => e.type === "Holiday").forEach(e => {
        if (!holidays[moment(e.date).format("D/M/Y")]) {
            holidays[moment(e.date).format("D/M/Y")] = [];
        }
        holidays[moment(e.date).format("D/M/Y")].push(e);
    });
    const lastyearholidayschedules = await uc.getHolidaySchedulesAtMomentByHoliday(
        db,
        moment(end).subtract(1, "years"),
        holidays
    );

    try {
        const ans = rec(
            begin,
            allexisting,
            shifts,
            users,
            constraints,
            events,
            holidays,
            allexisting,
            lastyearholidayschedules,
            end,
            new Date()
        );
        if (ans) {
            // Filter existing schedules
            return res.json(
                ans.filter(
                    o =>
                        Object.keys(copy).indexOf(
                            String(moment(o.date).valueOf())
                        ) === -1 ||
                        !copy[String(moment(o.date).valueOf())].find(
                            s =>
                                s.shift._id.toString() ===
                                o.shift._id.toString()
                        )
                )
            );
        }
        return res.status(505).send("No match found");
    } catch (err) {
        console.error(err);
        if (err instanceof TimeoutError) {
            return res.status(505).send("Request timed-out");
        }
        return res.status(505).send("No match found");
    }
});
router.post("/check/:id", (req, res, next) => {
    const { m = moment() } = req.body;
    const { id } = req.params;
    db.findById(table, id, populate).then(c => {
        const constraint = userConstraints[c.type];
        constraint
            .isValidOn(m, c.groups.map(g => g._id))
            .then(() => res.json({ status: 0 }))
            .catch(e =>
                res.json({ status: 1, severity: c.severity, error: e.message })
            );
    });
});
router.get("/", (req, res, next) => {
    db.find(table, {}, populate)
        .then(ans => res.json(ans))
        .catch(err => {
            console.error(err);
            return res.json([]);
        });
});
router.post("/", (req, res, next) => {
    db.add(table, req.body, populate)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to insert object: ${err}`);
        });
});
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    db.updateById(
        table,
        id,
        {
            $set: req.body
        },
        populate
    )
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to update object: ${err}`);
        });
});
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.removeById(table, id, populate)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to delete object: ${err}`);
        });
});

module.exports = router;
