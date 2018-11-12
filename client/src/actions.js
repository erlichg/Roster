import {createActions} from "redux-actions";
import moment from "moment";

export const {
    getobjects,
    addobject,
    removeobject,
    updateobject,
    showmodal,
    hidemodal,
    setholidays,
    setuser,
    getuser,
    getevents,
    addevent,
    removeevent,
    setmoment,
    getconstrainttypes,
    checkconstraint,
    autopopulate,
    clearpotentialschedules,
    seterror,
} = createActions({
    GETOBJECTS: type => ({
        type,
        async: true,
        url: "/api/" + type,
        method: "get",
    }),
    ADDOBJECT: (type, data) => ({
        type,
        async: true,
        url: "/api/" + type,
        data,
        method: "post"
    }),
    REMOVEOBJECT: (type, id) => ({
        type,
        async: true,
        url: "/api/" + type + "/" + id,
        method: "delete"
    }),
    UPDATEOBJECT: (type, id, data) => ({
        type,
        async: true,
        url: "/api/" + type + "/" + id,
        data,
        method: "put"
    }),
    SHOWMODAL: modaloptions => ({
        buttons: [],
        title: 'Title',
        message: '',
        ...modaloptions
    }),
    HIDEMODAL: () => ({}),
    SETHOLIDAYS: holidays => holidays,
    SETUSER: user => user,
    GETUSER: () => ({
        async: true,
        url: "/loggeduser",
        method: "get"
    }),
    GETEVENTS: () => ({
        type: "events",
        async: true,
        url: "/api/events",
        method: "get",
        post: events => {
            const events_dict = {};
            events.forEach(e => {
                // if (moment(e.date).isBetween(this.state.start, this.state.end, null, '[]')) {
                const m = moment(e.date).startOf('day');
                if (!events_dict[m.format("D/M/Y")]) {
                    events_dict[m.format("D/M/Y")] = [];
                }
                events_dict[m.format("D/M/Y")].push(e);
                // }
            });
            return events_dict;
        }
    }),
    ADDEVENT: data => ({
        type: "events",
        async: true,
        url: "/api/events",
        data,
        method: "post",
        post: (events, event) => {
            const m = moment(event.date).startOf('day');
            const arr = events[m.format("D/M/Y")] || [];
            return {...events, [m.format("D/M/Y")]:[...arr, event]};
        }
    }),
    REMOVEEVENT: id => ({
        type: "events",
        async: true,
        url: "/api/events/" + id,
        method: "delete",
        post: (events, event) => {
            const m = moment(event.date).startOf('day');
            return {...events, [m.format("D/M/Y")]:events[m.format("D/M/Y")].filter(e=>e._id!==event._id)};
        }
    }),
    SETMOMENT: m => m,
    GETCONSTRAINTTYPES: () => ({
        async: true,
        url: "/api/constraints/types",
        method: "get"
    }),
    CHECKCONSTRAINT: (id, m) => ({
        id,
        async: true,
        url: "/api/constraints/check/" + id,
        data: { m },
        method: "post"
    }),
    AUTOPOPULATE: (m) => ({
        async: true,
        url: "/api/constraints/autopopulate",
        data: { m },
        method: "post"
    }),
    CLEARPOTENTIALSCHEDULES: () => ({}),
    SETERROR: error => ({error}),
});
