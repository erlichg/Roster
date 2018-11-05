const express = require("express");
const Moment = require("moment");
const MomentRange = require("moment-range");
const _ = require("lodash");
const async = require("async");
const db = require("../db/db");
const uc = require("../userConstraints");
const getHolidays = require("../client/src/holidays");

const userConstraints = uc.constraints(db);

const moment = MomentRange.extendMoment(Moment);
const table = "Constraints";
const populate = ["groups"];
const router = express.Router();

function cartesianProduct(arrays) {
    const current = new Array(arrays.length);
    return (function* backtracking(index) {
        if (index === arrays.length) yield current.slice();
        else
            for (const num of arrays[index]) {
                current[index] = num;
                yield* backtracking(index + 1);
            }
    })(0);
}
// for (const item of cartesianProduct([1, 2], [10, 20], [100, 200, 300])) {
//     console.log(`[${item.join(", ")}]`);
// }

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

const getPreviousScheduleThisWeek = (shift, day, sofar) => {
    for (let i = 0; i < 7 /* day.day() */; i += 1) {
        const ans = (sofar[moment(day).day(i)] || []).filter(
            s => s.shift._id.toString() === shift._id.toString()
        )[0];
        if (ans) {
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
    let possible;
    const exists = schedules.find(
        sc => sc.shift._id.toString() === shift._id.toString()
    );
    if (exists) {
        possible = [exists.user];
    } else {
        const notSameWeekConstraints = constraints.filter(
            c => c.type === "notSameWeek"
        );
        const previousschedule = getPreviousScheduleThisWeek(shift, day, sofar);
        const groups = _.concat(...notSameWeekConstraints.map(c => c.groups));
        if (
            notSameWeekConstraints.length > 0 &&
            previousschedule &&
            uc.userInGroups(previousschedule.user, groups)
        ) {
            possible = [previousschedule.user];
        } else {
            const previoususers = getPreviousUsersThisWeek(shift, day, sofar);
            possible = users.filter(
                u =>
                    u.groups.indexOf(shift.group._id) !== -1 &&
                    previoususers.indexOf(u._id.toString()) === -1
            );
        }
    }

    // filter users that already have a schedule today
    const todayusers = (sofar[day] || []).map(schedule =>
        schedule.user._id.toString()
    );
    possible = possible.filter(
        u => todayusers.indexOf(u._id.toString()) === -1
    );

    // filter users that are on vacation today
    const notOnVacationConstraints = constraints.filter(
        c => c.type === "notOnVacation"
    );
    if (notOnVacationConstraints.length > 0) {
        const groups = _.concat(...notOnVacationConstraints.map(c => c.groups));
        // filter list of users to those that either don't belong in constraint groups or don't have any event today
        possible = possible.filter(
            u =>
                !uc.userInGroups(u, groups) ||
                !events.find(e => moment(e.date).isSame(day))
        );
    }

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
                                uu => uu._id.toString() === u._id.toString()
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

    // filter users that were last week
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
                                .subtract(1, "weeks")
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

    return _.shuffle(possible);
};

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
    begin,
    end
) => {
    const shift = shifts.filter(
        s =>
            s.days.indexOf(day.day()) !== -1 &&
            (sofar[day] || []).filter(
                schedule => schedule.shift._id.toString() === s._id.toString()
            ).length === 0
    )[0];
    if (!shift) {
        if (moment(day).isSame(end)) {
            // we've reached the end of the month
            return sofar;
        }
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
            begin,
            end
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
            begin,
            end
        );
        if (p) {
            if (moment(day).isSame(end)) {
                // we are at last day and we have a positive possibility
                // need to check final constraint - fairness
                const leastUsedUserConstraints = constraints.filter(
                    c => c.type === "leastUsedUser"
                );
                if (leastUsedUserConstraints.length > 0) {
                    const groups = _.concat(
                        ...leastUsedUserConstraints.map(c => c.groups)
                    );
                    const histogram = _.flatMap(p)
                        .filter(schedule =>
                            uc.userInGroups(schedule.user, groups)
                        )
                        .reduce((map, schedule) => {
                            if (!map[schedule.user._id.toString()]) {
                                map[schedule.user._id.toString()] = 0;
                            }
                            map[schedule.user._id.toString()] +=
                                schedule.shift.weight;
                            return map;
                        }, {});
                    users.filter(u => uc.userInGroups(u, groups)).forEach(u => {
                        if (!histogram[u._id.toString()]) {
                            histogram[u._id.toString()] = 0;
                        }
                    });
                    if (
                        _.max(Object.values(histogram)) -
                            _.min(Object.values(histogram)) <
                        5
                    ) {
                        return _.flatMap(p);
                    }
                } else {
                    return _.flatMap(p);
                }
            } else {
                return p;
            }
        }
    }
    /* eslint-enable */
};

router.get("/types", (req, res, next) => res.json(userConstraints));
router.get("/autopopulate", async (req, res, next) => {
    const { m = moment() } = req.body;
    const allexisting = await uc.getAllSchedulesInRangeByDay(m, db); // a list by day of all schedules or exceptions if any
    const copy = _.clone(allexisting);
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
    const users = _.shuffle(await db.find("Users")); // shuffle to return different possibility each time
    const shifts = await db.find(
        "Shifts",
        {
            enabled: true,
            group: { $exists: true }
        },
        ["group"]
    );
    const holidays = await getHolidays();
    const lastyearholidayschedules = await uc.getHolidaySchedulesAtMomentByHoliday(
        db,
        moment(m).subtract(1, "years"),
        holidays
    );

    try {
        const ans = rec(
            begin,
            {},
            shifts,
            users,
            constraints,
            events,
            holidays,
            allexisting,
            lastyearholidayschedules,
            begin,
            end
        );
        if (ans) {
            return res.json(
                _.xorBy(
                    _.flatMap(copy),
                    ans,
                    a =>
                        `${a.shift._id.toString()}_${moment(a.date).format(
                            "D/M/Y"
                        )}`
                )
            );
        }
        return res.status(505).send("No match found");
    } catch (err) {
        console.error(err);
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
    db.updateById(table, id, { $set: req.body }, populate)
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
