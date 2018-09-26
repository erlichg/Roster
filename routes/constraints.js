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
        return [undefined];
    }
    if (arr.length === 1) {
        return arr[0];
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

router.get("/types", (req, res, next) => res.json(userConstraints));
router.get("/autopopulate", async (req, res, next) => {
    const { m = moment() } = req.body;
    const existing = await uc.getSchedulesInRange(m, db);
    const weeks = _.range(
        moment(m)
            .startOf("month")
            .week(),
        moment(m)
            .endOf("month")
            .week() + 1
    ).map(week =>
        moment()
            .year(m.year())
            .week(week)
            .startOf("week")
    );
    const events = await db.find("Events", {
        date: { $gte: weeks[0], $lte: weeks[weeks.length - 1] }
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
    const needed = weeks.map(w =>
        shifts.map(s => {
            const e = existing.find(sw =>
                sw.find(
                    sc =>
                        sc.week === w.week() &&
                        sc.year === w.year() &&
                        sc.shift._id.toString() === s._id.toString()
                )
            );
            return e
                ? e.find(
                      sc =>
                          sc.week === w.week() &&
                          sc.year === w.year() &&
                          sc.shift._id.toString() === s._id.toString()
                  )
                : s;
        })
    );
    const weekp = needed
        .map((weekshifts, week) => {
            const weekshiftsproduct = product(
                weekshifts.map(shift => {
                    if (shift.constructor.modelName === "Schedule") {
                        return [shift.user];
                    }
                    let ans = users.filter(
                        u => u.groups.indexOf(shift.group._id) !== -1
                    );
                    const notOnVacationConstraints = constraints.filter(
                        c => c.type === "notOnVacation"
                    );
                    if (notOnVacationConstraints.length > 0) {
                        const groups = _.concat(
                            ...notOnVacationConstraints.map(c => c.groups)
                        );
                        ans = ans.filter(
                            u =>
                                !uc.userInGroups(u, groups) ||
                                !uc.userHasEventsOnScedule(
                                    {
                                        week: weeks[week].week(),
                                        year: weeks[week].year(),
                                        user: u,
                                        shift
                                    },
                                    events
                                )
                        );
                    }
                    const notConecutiveHolidayConstraints = constraints.filter(
                        c => c.type === "notConecutiveHoliday"
                    );
                    if (notConecutiveHolidayConstraints.length > 0) {
                        const groups = _.concat(
                            ...notConecutiveHolidayConstraints.map(
                                c => c.groups
                            )
                        );
                        ans = ans.filter(
                            u =>
                                !uc.userInGroups(u, groups) ||
                                !uc
                                    .getUserHolidayInSchedule(
                                        {
                                            week: weeks[week].week(),
                                            year: weeks[week].year(),
                                            user: u,
                                            shift
                                        },
                                        holidays
                                    )
                                    .find(
                                        holiday =>
                                            lastyearholidayschedules[
                                                holiday.id
                                            ] &&
                                            lastyearholidayschedules[
                                                holiday.id
                                            ].find(
                                                uu =>
                                                    uu._id.toString() ===
                                                    u._id.toString()
                                            )
                                    )
                        );
                    }
                    return _.shuffle(ans);
                })
            );
            return weekshiftsproduct;
        })
        .map(p => {
            const notSameWeekConstraints = constraints.filter(
                c => c.type === "notSameWeek"
            );
            if (notSameWeekConstraints.length > 0) {
                const groups = _.concat(
                    ...notSameWeekConstraints.map(c => c.groups)
                );
                return p.filter(
                    _users =>
                        !_users
                            .filter(u => u && uc.userInGroups(u, groups))
                            .hasDuplicates()
                );
            }
            return p;
        });
    const possibilities = cartesianProduct(weekp);
    try {
        async.detect(
            Array.from(possibilities),
            (pp, callback) => {
                if (res.headersSent) {
                    throw Error();
                }
                const p = _.concat(
                    _.assign(
                        _.fill(new Array(shifts.length), undefined),
                        existing[0].map(s => s.user)
                    ),
                    _.flatten(pp),
                    _.assign(
                        _.fill(new Array(shifts.length), undefined),
                        existing[existing.length - 1].map(s => s.user)
                    )
                );
                const notConsecutiveWeekConstraints = constraints.filter(
                    c => c.type === "notConsecutiveWeek"
                );
                if (notConsecutiveWeekConstraints.length > 0) {
                    const groups = _.concat(
                        ...notConsecutiveWeekConstraints.map(c => c.groups)
                    );
                    // we now have extra 2 weeks
                    const intersect = _.range(0, weeks.length + 1).find(w => {
                        const users1 = p
                            .slice(
                                w * shifts.length,
                                w * shifts.length + shifts.length
                            )
                            .filter(u => u && uc.userInGroups(u, groups));
                        const users2 = p
                            .slice(
                                (w + 1) * shifts.length,
                                (w + 1) * shifts.length + shifts.length
                            )
                            .filter(u => u && uc.userInGroups(u, groups));
                        return (
                            _.intersectionBy(users1, users2, u =>
                                u._id.toString()
                            ).length > 0
                        );
                    });
                    if (intersect) {
                        return callback(null, false);
                    }
                }
                const leastUsedUserConstraints = constraints.filter(
                    c => c.type === "leastUsedUser"
                );
                if (leastUsedUserConstraints.length > 0) {
                    const groups = _.concat(
                        ...leastUsedUserConstraints.map(c => c.groups)
                    );
                    const histogram = {};
                    p.map((u, i) => ({
                        user: u,
                        shift: shifts[i % shifts.length]
                    }))
                        .filter(u => u.user && uc.userInGroups(u.user, groups))
                        .forEach(u => {
                            const current =
                                histogram[u.user._id.toString()] || 0;
                            histogram[u.user._id.toString()] =
                                current + u.shift.weight;
                        });

                    if (
                        _.max(Object.values(histogram)) -
                            _.min(Object.values(histogram)) >
                        1
                    ) {
                        return callback(null, false);
                    }
                }
                return callback(null, true);
            },
            (err, result) => {
                if (result) {
                    const ans = _.flatten(result)
                        .map((user, i) => ({
                            week: weeks[Math.floor(i / shifts.length)].week(),
                            year: weeks[Math.floor(i / shifts.length)].year(),
                            user,
                            shift: shifts[i % shifts.length]
                        }))
                        .filter(
                            schedule =>
                                !existing.find(ws =>
                                    ws.find(
                                        s =>
                                            s.shift._id.toString() ===
                                                schedule.shift._id.toString() &&
                                            s.week === schedule.week
                                    )
                                )
                        );
                    return res.json(ans);
                }
                return res.status(505).send("No match found");
            }
        );
    } catch (err) {
        if (res.headersSent) {
            // do nothing since error is expected in case of match
        } else {
            console.error(err);
            return res.status(505).send("No match found");
        }
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
