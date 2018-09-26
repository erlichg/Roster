const Moment = require("moment");
const extendMoment = require("moment-range").extendMoment;
const Holidays = require("date-holidays");
const _ = require("lodash");
const jewish = require("./hebcal");

const moment = extendMoment(Moment);
const getholidays = () =>
    new Promise((resolve, reject) => {
        const holidays = {};
        _.concat(new Holidays("US")
            .getHolidays(moment().year()-1), new Holidays("US")
            .getHolidays(moment().year()), new Holidays("US")
            .getHolidays(moment().year()+1))
            .filter(h => h.type === "public")
            .forEach(h => {
                Array.from(
                    moment.range(h.start, h.end).by("day", { excludeEnd: true })
                ).forEach(m => {
                    const mm = m.startOf("day");
                    if (!holidays[mm]) {
                        holidays[mm] = [];
                    }
                    holidays[mm].push({
                        location: "US",
                        name: h.name,
                        id: h.name
                    });
                });
            });
        _.concat(
            ...Object.values(new jewish.GregYear(moment().year()-1).holidays).map(events =>
                events.filter(e => e.VACATION).map(event => ({
                    date: event.date.greg(),
                    desc: event.desc[0],
                    id: event.id
                }))
            ),
            ...Object.values(new jewish.GregYear(moment().year()).holidays).map(events =>
                events.filter(e => e.VACATION).map(event => ({
                    date: event.date.greg(),
                    desc: event.desc[0],
                    id: event.id
                }))
            ),
            ...Object.values(new jewish.GregYear(moment().year()+1).holidays).map(events =>
                events.filter(e => e.VACATION).map(event => ({
                    date: event.date.greg(),
                    desc: event.desc[0],
                    id: event.id
                }))
            ),
        ).forEach(h => {
            const m = moment(h.date).startOf("day");
            if (!holidays[m]) {
                holidays[m] = [];
            }
            holidays[m].push({
                location: "Israel",
                name: h.desc,
                id: h.id
            });
        });
        resolve(holidays);
    });

module.exports = getholidays;
