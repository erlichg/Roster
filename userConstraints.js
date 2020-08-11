const Moment = require("moment");
const MomentRange = require("moment-range");
const _ = require("lodash");
const getHolidays = require("./client/src/holidays");

const moment = MomentRange.extendMoment(Moment);

const getBegin = m =>
    moment
        .utc(m)
        .subtract(2, "months")
        .startOf("month")
        .startOf("week");
const getEnd = m =>
    moment
        .utc(m)
        .endOf("month")
        .endOf("week");

const getAllSchedulesInRangeByDay = async (
    m,
    db,
    populate = ["shift", "user"]
) => {
    const begin = getBegin(m);
    const end = getEnd(m);
    const schedules = await db.find(
        "Schedules",
        {
            date: { $gte: begin, $lte: end }
        },
        populate
    );
    return Array.from(moment.range(begin, end).by("day")).reduce((map, day) => {
        map[day] = schedules.filter(sc => moment(sc.date).isSame(day));
        return map;
    }, {});
};

const getAllEventsInRangeByDay = async (m, db, populate = ["user"]) => {
    const begin = getBegin();
    const end = getEnd();
    const events = await db.find(
        "Events",
        {
            date: { $gte: begin, $lte: end }
        },
        populate
    );
    return Array.from(moment.range(begin, end).by("day")).reduce((map, day) => {
        map[day] = events.filter(sc => moment(sc.date).isSame(day));
        return map;
    }, {});
};

const userInGroups = (user, groups) =>
    _.intersection(
        user.groups.map(g => g.toString()),
        groups.map(g => g.toString())
    ).length > 0;

const getScheduleDays = schedule =>
    schedule.shift.days.map(d =>
        moment()
            .year(schedule.year)
            .week(schedule.week)
            .day(d)
            .startOf("day")
    );

/**
 * Returns array of holidays that fall on the schedule and in user locale
 * @param {*} schedule
 * @param {*} holidays
 */
const getUserHolidayInSchedule = (schedule, holidays) =>
    _.concat(
        getScheduleDays(schedule).map(day =>
            (holidays[day] || []).find(
                h => h.location === schedule.user.location
            )
        )
    ).filter(h => h);

/**
 * Returns all schedules at m year that fall on a holiday
 * @param {*} db
 * @param {*} m
 * @param {*} holidays
 */
const getHolidaySchedulesAtMomentByHoliday = async (db, m, holidays) => {
    const schedules = await getAllSchedulesInRangeByDay(m, db);
    const events = await db.find("Events", {}, ["user"]);
    const ans = {};
    Object.keys(schedules).forEach(day => {
        if (
            schedules[day].length > 0 &&
            holidays[moment(day).format("D/M/Y")]
        ) {
            holidays[moment(day).format("D/M/Y")].forEach(holiday => {
                if (!ans[holiday.id]) {
                    ans[holiday.id] = [];
                }
                schedules[day]
                    .filter(s => s.user !== null && s.user.location === holiday.location)
                    .forEach(s => {
                        ans[holiday.id].push(s.user);
                    });
            });
        }
        if (
            schedules[day].length > 0 &&
            events.find(
                e => e.type === "Holiday" && moment(e.date).isSame(moment(day))
            )
        ) {
            const holiday = events.find(
                e => e.type === "Holiday" && moment(e.date).isSame(moment(day))
            );
            if (!ans[holiday.id]) {
                ans[holiday.id] = [];
            }
            schedules[day].forEach(s => {
                ans[holiday.id].push(s.user);
            });
        }
    });
    return ans;
};

const getSchedulesInMoment = (db, m, populate = ["shift"]) =>
    db.find(
        "Schedules",
        {
            date: m
        },
        populate
    );

const userHasEventsOnScedule = (schedule, events) =>
    getScheduleDays(schedule).find(day =>
        events.find(
            e =>
                moment(e.date).isSame(day) &&
                e.user.toString() === schedule.user._id.toString()
        )
    );

/**
 * Returns array of moments of last year's holiday
 * @param {*} day the moment for current year
 * @param {*} holiday the holiday
 * @param {*} holidays dict of all holidays
 */
const getLastYearHoliday = (day, holiday, holidays) =>
    Object.keys(holidays).filter(
        m =>
            moment(m).year() === day.year() - 1 &&
            holidays[m].find(h => h.id === holiday.id)
    );

const isHoliday = (day, location, holidays) =>
    holidays[moment(day).format("D/M/Y")] &&
    holidays[moment(day).format("D/M/Y")].filter(h => h.location === location)
        .length > 0;

module.exports = {
    getBegin,
    getAllSchedulesInRangeByDay,
    getSchedulesInMoment,
    getScheduleDays,
    userHasEventsOnScedule,
    userInGroups,
    getUserHolidayInSchedule,
    getLastYearHoliday,
    getHolidaySchedulesAtMomentByHoliday,
    constraints: db => ({
        notOnUnavailability: {
            label: "Not On Unavailability",
            description:
                "This constraint maintains that a user cannot have a shift if he is on vacation",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const events = await getAllEventsInRangeByDay(m, db);
                await Object.keys(_schedules).asyncForEach(async day => {
                    await (_schedules[day] || []).asyncForEach(
                        async schedule => {
                            if (
                                (events[day] || []).find(
                                    e =>
                                        e.type === "Unavailability" && e.user !== null && e.user._id !== null && schedule.user !== null &&
                                        e.user._id.toString() ===
                                            schedule.user.toString()
                                )
                            ) {
                                throw Error(
                                    `User ${
                                        schedule.user.name
                                    } has a shift on ${moment(day).format(
                                        "D/M"
                                    )} while he is on vacation`
                                );
                            }
                        }
                    );
                });
            }
        },
        notConsecutiveWeek: {
            label: "Not Consecutive weeks",
            description:
                "This constraint maintains that no user has a more than 1 shift in 1 3 week duration",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const users = {};
                Object.keys(_schedules).forEach(day => {
                    _schedules[day]
                        .filter(schedule => schedule.user !== null && userInGroups(schedule.user, groups))
                        .forEach(schedule => {
                            if (!users[moment(schedule.date).week()]) {
                                users[moment(schedule.date).week()] = [];
                            }
                            users[moment(schedule.date).week()].push(
                                schedule.user
                            );
                        });
                });
                Object.keys(users)
                    .sort()
                    .forEach(week => {
                        if (users[week - 1]) {
                            const problems = _.intersectionBy(
                                users[week],
                                users[week - 1],
                                u => u._id.toString()
                            );
                            if (problems.length !== 0) {
                                throw Error(
                                    `Following users have shifts on consecutive weeks:<br>${problems
                                        .map(u => u.name)
                                        .join("<br>")}`
                                );
                            }
                        }
                    });
            }
        },
        notSameWeek: {
            label: "Not Same week",
            description:
                "This constraint maintains that no user has more than 1 shift in the same week",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const users = {};
                const holidays = await getHolidays();
                const events = await getAllEventsInRangeByDay(m, db);
                Object.keys(_schedules).forEach(day => {
                    _schedules[day]
                        .filter(schedule => schedule.user !== null && userInGroups(schedule.user, groups))
                        .forEach(schedule => {
                            if (!users[moment(schedule.date).week()]) {
                                users[moment(schedule.date).week()] = [];
                            }
                            users[moment(schedule.date).week()].push(schedule);
                        });
                });
                let problems = [];
                Object.keys(users).forEach(week => {
                    problems = _.concat(
                        problems,
                        _.difference(
                            users[week],
                            _.uniqWith(
                                users[week],
                                (s1, s2) =>
                                    s1.user._id.toString() ===
                                        s2.user._id.toString() &&
                                    s1.shift._id.toString() !==
                                        s2.shift._id.toString()
                            )
                        ) /* we remove "duplicate" entries where the user is the same but shift is different */
                            .filter(
                                s =>
                                    _.concat(
                                        (
                                            holidays[
                                                moment(s.date).format("D/M/Y")
                                            ] || []
                                        ).filter(
                                            h =>s.user !== null && h.location === s.user.location
                                        ),
                                        (events[s.date] || []).filter(
                                            e => e.type === "Holiday"
                                        )
                                    ).length === 0
                            )
                    ); /* We remove the entries which fall on a holday */
                });
                if (problems.length !== 0) {
                    throw Error(
                        `Following users have different shifts in same weeks:<br>${problems
                            .map(
                                u =>
                                    `${u.user.name} on ${moment(u.date).format(
                                        "D/M/Y"
                                    )}`
                            )
                            .join("<br>")}`
                    );
                }
            }
        },
        leastUsedUser: {
            label: "Least Used User",
            description:
                'This constraint maintains that the users are "spread" evenly across all shifts',
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const users = await db.find("Users", { enabled: true });
                /* eslint-disable no-restricted-syntax */
                for (const group of groups) {
                    const susers = {};
                    Object.keys(_schedules).forEach(day => {
                        _schedules[day]
                            .filter(schedule => schedule.user !== null &&
                                userInGroups(schedule.user, [group])
                            )
                            .forEach(schedule => {
                                if (!susers[schedule.user._id.toString()]) {
                                    users[schedule.user._id.toString()] = 0;
                                }
                                susers[schedule.user._id.toString()] +=
                                    schedule.weight;
                            });
                    });
                    users.forEach(u => {
                        if (!susers[u._id.toString()]) {
                            susers[u._id.toString()] = 0;
                        }
                    });
                    if (
                        _.max(Object.values(susers)) -
                            _.min(Object.values(susers)) >
                        5
                    ) {
                        throw Error("Users schedules are not spread evenly");
                    }
                }
                /* eslint-enable */
            }
        },
        notConecutiveHoliday: {
            label: "Not Consecutive Holiday",
            description:
                "This constraint maintains that no user has a shift on same holiday in consecutive years",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const holidays = await getHolidays();
                const events = await getAllEventsInRangeByDay(m, db);
                const lastyearholidayschedules = await getHolidaySchedulesAtMomentByHoliday(
                    db,
                    moment(m).subtract(1, "years"),
                    holidays
                );
                const problems = [];
                await Object.keys(_schedules).asyncForEach(async day => {
                    await (_schedules[day] || []).asyncForEach(
                        async schedule => {
                            const holiday = _.concat(
                                (
                                    holidays[moment(day).format("D/M/Y")] || []
                                ).filter(
                                    h => schedule.user !== null && h.location === schedule.user.location
                                ),
                                (events[day] || []).filter(
                                    e => e.type === "Holiday"
                                )
                            )[0];
                            if (
                                holiday &&
                                (lastyearholidayschedules[holiday.id] || [])
                                    .map(u => u._id.toString())
                                    .indexOf(schedule.user._id.toString()) !==
                                    -1
                            ) {
                                problems.push({
                                    schedule,
                                    holiday
                                });
                            }
                        }
                    );
                });
                if (problems.length > 0) {
                    throw Error(
                        `Following issues found:<br>${_.uniqBy(
                            problems,
                            p => p.holiday.id
                        ).map(
                            problem =>
                                `User ${
                                    problem.schedule.user.name
                                } has a shift on holiday ${
                                    problem.holiday.id
                                } 2 years in a row<br>`
                        )}`
                    );
                }
            }
        },
        holidaySplit: {
            label: "Split shift on holidays (i.e. different user)",
            description:
                "This constraint maintains that a shift is split between 2 users on days with holiday",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getAllSchedulesInRangeByDay(m, db));
                const holidays = await getHolidays();
                const events = await db.find("Events", {
                    date: {
                        $gte: getBegin(),
                        $lte: getEnd()
                    }
                });
                events.filter(e => e.type === "Holiday").forEach(e => {
                    if (!holidays[moment(e.date).format("D/M/Y")]) {
                        holidays[moment(e.date).format("D/M/Y")] = [];
                    }
                    holidays[moment(e.date).format("D/M/Y")].push(e);
                });
                const shifts = {};
                Object.keys(_schedules).forEach(day => {
                    _schedules[day].forEach(schedule => {
                        if (!(schedule.shift._id.toString() in shifts)) {
                            shifts[schedule.shift._id.toString()] = [];
                        }
                        shifts[schedule.shift._id.toString()].push(schedule);
                    });
                });
                const problems = [];
                Object.keys(shifts).forEach(id => {
                    shifts[id] = shifts[id].sort(
                        (a, b) => moment(a.date) - moment(b.date)
                    );
                    for (let i = 0; i < shifts[id].length - 1; i += 1) {
                        const schedule = shifts[id][i];
                        const nextschedule = shifts[id][i + 1];
                        if (
                            schedule.user !== null && nextschedule.user !== null && schedule.user._id.toString() ===
                                nextschedule.user._id.toString() &&
                            isHoliday(
                                schedule.date,
                                schedule.user.location,
                                holidays
                            ) !==
                                isHoliday(
                                    nextschedule.date,
                                    nextschedule.user.location,
                                    holidays
                                )
                        ) {
                            problems.push(
                                `User ${
                                    schedule.user.name
                                } has a shift on ${moment(schedule.date).format(
                                    "D/M"
                                )} and ${moment(nextschedule.date).format(
                                    "D/M"
                                )} while one of them is a holiday<br>`
                            );
                        }
                    }
                });
                if (problems.length > 0) {
                    throw Error(
                        `Following issues found:<br>${problems.join("")}`
                    );
                }
            }
        }
    })
};
