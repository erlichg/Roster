import ReactTooltip from 'react-tooltip';
import {handleActions} from "redux-actions";
import moment from "moment";
import {
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
} from "./actions";

export const defaultState = {
    counter: 0,
    users: [],
    groups: [],
    shifts: [],
    schedules: [],
    modal: false,
    modaloptions: {},
    holidays: {},
    events: {},
    user: undefined,
    // {
    //     "_id": "5b6c2470ce291463400b05d7",
    //     "name": "Guy",
    //     "email": "guy.erlich@emc.com",
    //     "groups": [],
    //     "constraints": [],
    //     "__v": 0,
    //     "role": {
    //         "_id": "5b6c2b122822f30edba70bca",
    //         "name": "Admin"
    //     }
    // },
    roles: [],
    moment: moment(),
    constraints: [],
    constrainttypes: {},
    constraintsresults: {},
    potentialconstraintsresults: {},
    potentialschedules: [],
    busy: false,
    error: undefined,
    messages: [],
};

export const reducer = handleActions({
    [getobjects]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? action.result
            : state[action.payload.type]
    }),
    [addobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? [
                ...state[action.payload.type],
                action.result
            ]
            : state[action.payload.type],
        constraintsresults: {}
    }),
    [removeobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? state[action.payload.type].filter(o => o._id !== action.result._id)
            : state[action.payload.type],
        constraintsresults: {}
    }),
    [updateobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? state[action.payload.type].map(o => o._id === action.result._id
                ? {
                    ...o,
                    ...action.result
                }
                : o)
            : state[action.payload.type],
        constraintsresults: {}
    }),
    [showmodal]: (state, action) => ({
        ...state,
        modal: true,
        modaloptions: action.payload
    }),
    [hidemodal]: state => ({
        ...state,
        modal: false
    }),
    [setholidays]: (state, action) => ({
        ...state,
        holidays: action.payload
    }),
    [setuser]: (state, action) => ({
        ...state,
        user: state
            .users
            .filter(u => u.name === action.payload)[0] || state.user
    }),
    [getuser]: (state, action) => ({
        ...state,
        user: action.success ? action.result : state.user
    }),
    [getevents]: (state, action) => ({
        ...state,
        events: action.success
            ? action
                .payload
                .post(action.result)
            : state.events
    }),
    [addevent]: (state, action) => ({
        ...state,
        events: action.success
            ? action
                .payload
                .post(state.events, action.result)
            : state.events,
        constraintsresults: {}
    }),
    [removeevent]: (state, action) => ({
        ...state,
        events: action.success
            ? action
                .payload
                .post(state.events, action.result)
            : state.events,
        constraintsresults: {}
    }),
    [setmoment]: (state, action) => ({
        ...state,
        moment: action.payload
    }),
    [getconstrainttypes]: (state, action) => ({
        ...state,
        constrainttypes: action.success
            ? action.result
            : state.constrainttypes
    }),
    [checkconstraint]: (state, action) => ({
        ...state,
        constraintsresults: action.success
            ? {
                ...state.constraintsresults,
                [action.payload.id]: action.result
            }
            : state.constraintsresults
    }),
    [autopopulate]: (state, action) => ({
        ...state,
        busy: action.success === undefined,
        potentialschedules: action.success ? action.result : state.potentialschedules
    }),
    [clearpotentialschedules]: state => ({
        ...state,
        potentialschedules: []
    }),
    [seterror]: (state, action) => ({
        ...state,
        error: action.payload.error
    })
}, defaultState);

// Middleware method to post/get data from server It runs anytime you dispatch
// an action with payload.async=true. Be aware the action gets called before and
// after the middleware so expect an empty result in the action
export const asyncActionsMiddleware = store => next => action => {
    const isActionAsync = action.payload.async;
    if (!isActionAsync) {
        return next(action);
    }

    const {url, data, method} = action.payload;
    let options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    fetch(url, options)
        .then(ans => new Promise((resolve, reject) => ans.ok ? resolve(ans) : ans.text().then(text => reject({message: text})))) /* if ans is ok (status between 200 and 300) than continue, otherwise get text and reject */
        .then(resultsObj => resultsObj.json())
        .then(json => {
            next({
                ...action,
                result: json,
                success: true
            }); // Success result
        })
        .catch(err => {
            console.error(err);
            store.dispatch(seterror(`Server error: ${err.message}`));
            next({
                ...action,
                success: false
            }); // Failure result. Comment to not call action in this case
        });

    return next(action); //This calls the action first to allow changing state while fetching
};

export const reactTooltipMiddleWare = store => next => action => {
    const ans = next(action);
    ReactTooltip.rebuild();
    return ans;
}
