import Moment from 'moment';
import {extendMoment} from 'moment-range';
import Holidays from 'date-holidays';

const moment = extendMoment(Moment);

export const getholidays = () => {
    return new Promise((resolve, reject) => {
        let holidays = {};
        new Holidays('US').getHolidays().filter(h=>h.type==='public').forEach(h=>{
            Array.from(moment.range(h.start, h.end).by('day', { excludeEnd: true })).forEach(m=>{
                const mm = m.startOf('day');
                if (!holidays[mm]) {
                    holidays[mm] = [];
                }
                holidays[mm].push(h.name)
            })
        })
        const year = moment().year();
        Promise.all([
            fetch(`https://www.hebcal.com/hebcal/?v=1&cfg=json&maj=on&min=off&mod=on&nx=off&year=${year-1}&month=x&ss=off&mf=off&c=off&geo=none&s=off`).then(d=>d.json()),
            fetch(`https://www.hebcal.com/hebcal/?v=1&cfg=json&maj=on&min=off&mod=on&nx=off&year=now&month=x&ss=off&mf=off&c=off&geo=none&s=off`).then(d=>d.json()),
            fetch(`https://www.hebcal.com/hebcal/?v=1&cfg=json&maj=on&min=off&mod=on&nx=off&year=${year+1}&month=x&ss=off&mf=off&c=off&geo=none&s=off`).then(d=>d.json()),
        ])
        .then(values=>{
            values.forEach(d=>{
                d.items.forEach(h=>{
                    const m = moment(h.date).startOf('day');
                    if (!holidays[m]) {
                        holidays[m] = [];
                    }
                    holidays[m].push(h.hebrew)
                });
            });
            resolve(holidays);
        })
        .catch(err=>{
            console.error(err);
            reject(err);
        });
    })
}