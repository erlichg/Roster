const Moment = require("moment");
const MomentRange = require("moment-range");
const _ = require("lodash");
const getHolidays = require("./client/src/holidays");

const moment = MomentRange.extendMoment(Moment);

const getScheduleMoment = schedule =>
    moment()
        .year(schedule.year)
        .week(schedule.week)
        .startOf("day");

const getWeekRange = m =>
    _.range(
        moment(m)
            .startOf("month")
            .subtract(1, "weeks")
            .week(),
        moment(m)
            .endOf("month")
            .add(1, "weeks")
            .week() + 1
    ).map(week =>
        moment()
            .year(m.year())
            .week(week)
            .startOf("week")
    );

const getSchedulesInRange = async (m, db, populate = ["shift", "user"]) => {
    const weeks = getWeekRange(m);
    const ans = new Array(weeks.length);
    await weeks.asyncForEach(async (week, i) => {
        ans[i] = await db.find(
            "Schedules",
            {
                week: week.week(),
                year: week.year()
            },
            populate
        );
        ans[i] = ans[i].filter(s => s.shift.enabled);
    });
    return ans;
};

const getSchedulesInMoment = (db, m, populate = ["shift"]) =>
    db.find(
        "Schedules",
        {
            week: m.week(),
            year: m.year()
        },
        populate
    );

const getScheduleDays = schedule =>
    schedule.shift.days.map(d =>
        moment()
            .year(schedule.year)
            .week(schedule.week)
            .day(d)
            .startOf("day")
    );

const isDayInSchedule = (schedule, day) => getScheduleDays.indexOf(day) !== -1;

const userHasEventsOnScedule = (schedule, events) =>
    getScheduleDays(schedule).find(day =>
        events.find(
            e =>
                moment(e.date).isSame(day) &&
                e.user.toString() === schedule.user._id.toString()
        )
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
    const schedules = await db.find("Schedules", { year: m.year() }, [
        "shift",
        "user"
    ]);
    const ans = {};
    schedules.forEach(s =>
        getUserHolidayInSchedule(s, holidays).forEach(holiday => {
            if (!ans[holiday.id]) {
                ans[holiday.id] = [];
            }
            ans[holiday.id].push(s.user);
        })
    );
    return ans;
};

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

const userInGroups = (user, groups) =>
    _.intersection(
        user.groups.map(g => g.toString()),
        groups.map(g => g.toString())
    ).length > 0;

module.exports = {
    getSchedulesInRange,
    getWeekRange,
    getSchedulesInMoment,
    getScheduleDays,
    userHasEventsOnScedule,
    userInGroups,
    getUserHolidayInSchedule,
    getLastYearHoliday,
    getHolidaySchedulesAtMomentByHoliday,
    constraints: db => ({
        notOnVacation: {
            label: "Not On Vacation",
            description:
                "This constraint maintains that a user cannot have a shift if he is on vacation",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getSchedulesInRange(m, db));
                const range = getWeekRange(m);
                const start = range[0];
                const end = range[range.length - 1];
                const events = await db.find("Events", {
                    date: { $gte: start, $lte: end }
                });
                await _schedules.asyncForEach(async week => {
                    await week.asyncForEach(async schedule => {
                        if (userHasEventsOnScedule(schedule, events)) {
                            throw Error(
                                `User ${
                                    schedule.user.name
                                } has a shift on the week of ${getScheduleMoment(
                                    schedule
                                ).format("D/M")} while he is on vacation`
                            );
                        }
                    });
                });
            }
        },
        notConsecutiveWeek: {
            label: "Not Consecutive week",
            description:
                "This constraint maintains that no user has a shift 2 weeks in a row",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getSchedulesInRange(m, db));
                const users = _schedules.map(ws =>
                    ws
                        .map(s => s.user)
                        .filter(
                            u =>
                                _.intersectionBy(u.groups, groups, g =>
                                    g.toString()
                                ).length > 0
                        )
                ); /* Array of arrays of users */
                for (let i = 0; i < users.length - 1; i += 1) {
                    const problems = _.intersectionBy(
                        users[i],
                        users[i + 1],
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
            }
        },
        notSameWeek: {
            label: "Not Same week",
            description:
                "This constraint maintains that no user has more than 1 shift in the same week",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getSchedulesInRange(m, db));
                const users = _schedules.map(ws =>
                    ws
                        .map(s => s.user)
                        .filter(
                            u =>
                                _.intersectionBy(u.groups, groups, g =>
                                    g.toString()
                                ).length > 0
                        )
                ); /* Array of arrays of users */
                for (let i = 0; i < users.length; i += 1) {
                    const problems = Object.entries(
                        _.countBy(users[i], u => u._id.toString())
                    )
                        .filter(arr => arr[1] > 1)
                        .map(arr => arr[0])
                        .map(id => users[i].find(u => u._id.toString() === id));
                    if (problems.length !== 0) {
                        throw Error(
                            `Following users have more than 1 shifts on the same week:<br>${problems
                                .map(u => u.name)
                                .join("<br>")}`
                        );
                    }
                }
            }
        },
        leastUsedUser: {
            label: "Least Used User",
            description:
                'This constraint maintains that the users are "spread" evenly across all shifts',
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getSchedulesInRange(m, db));
                const users = await db.find("Users");
                for (const group of groups) {
                    const susers = _.concat(
                        [],
                        _schedules.map(schedules =>
                            schedules
                                .filter(
                                    schedule =>
                                       schedule.shift.group._id.toString() === group._id.toString()
                                )
                                .map(s => s.user._id.toString())
                        )
                    );
                    const histogram = users.filter(u=>u.groups.find(g=>g._id.toString()===group._id.toString())).map(
                        u =>
                            susers.filter(
                                su => su.indexOf(u._id.toString()) !== -1
                            ).length
                    );
                    if (_.max(histogram) - _.min(histogram) > 1) {
                        throw Error(
                            `Users schedules are not spread evenly:<br>${_.zipWith(
                                users,
                                histogram,
                                (u, h) => `${u.name}: ${h}`
                            ).join("<br>")}`
                        );
                    }
                }
            }
        },
        notConecutiveHoliday: {
            label: "Not Consecutive Holiday",
            description:
                "This constraint maintains that no user has a shift on same holiday in consecutive years",
            isValidOn: async (m, groups, schedules) => {
                const _schedules =
                    schedules || (await getSchedulesInRange(m, db));
                const holidays = await getHolidays();
                const problems = [];
                const alreadydid = {};
                await _schedules.asyncForEach(async weekschedules => {
                    await weekschedules
                        .filter(
                            schedule =>
                                _.intersectionBy(
                                    schedule.user.groups,
                                    groups,
                                    g => g.toString()
                                ).length > 0
                        )
                        .asyncForEach(async schedule => {
                            await schedule.shift.days.asyncForEach(async d => {
                                const day = moment()
                                    .year(schedule.year)
                                    .week(schedule.week)
                                    .day(d)
                                    .startOf("day");
                                const holiday = (holidays[day] || []).find(
                                    h => h.location === schedule.user.location
                                );
                                if (holiday && !alreadydid[holiday.id]) {
                                    alreadydid[holiday.id] = true;
                                    const holidaylastyear = Object.keys(
                                        holidays
                                    ).filter(
                                        m =>
                                            moment(m).year() ===
                                                day.year() - 1 &&
                                            holidays[m].find(
                                                h => h.id === holiday.id
                                            )
                                    );
                                    await holidaylastyear.asyncForEach(
                                        async dd => {
                                            const lastyearschedules = await getSchedulesInMoment(
                                                db,
                                                moment(dd)
                                            );
                                            const c = lastyearschedules.find(
                                                s =>
                                                    s.shift.days.find(d =>
                                                        moment()
                                                            .year(s.year)
                                                            .week(s.week)
                                                            .day(d)
                                                            .startOf("day")
                                                            .isSame(moment(dd))
                                                    )
                                            );
                                            if (
                                                c &&
                                                c.user.toString() ===
                                                    schedule.user._id.toString()
                                            ) {
                                                problems.push({
                                                    schedule,
                                                    holiday
                                                });
                                            }
                                        }
                                    );
                                }
                            });
                        });
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
        }
    })
};
