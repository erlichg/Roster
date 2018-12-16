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
import { stat } from 'fs';

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
            ? 
            Array.isArray(action.result) ? 
            [
                ...state[action.payload.type],
                ...action.result
            ]
            :
            [
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
        constraintsresults: action.success
        ? {}
        : state.constraintsresults
    }),
    [removeevent]: (state, action) => ({
        ...state,
        events: action.success
            ? action
                .payload
                .post(state.events, action.result)
            : state.events,
        constraintsresults: action.success
        ? {}
        : state.constraintsresults
    }),
    [setmoment]: (state, action) => ({
        ...state,
        moment: action.payload,
        constraintsresults: {}
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
            : {
                ...state.constraintsresults,
                [action.payload.id]: undefined
            }
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

function fetchWithTimeout( url, options, timeout ) {
    return new Promise( (resolve, reject) => {
        // Set timeout timer
        let timer = setTimeout(
            () => reject( new Error('Request timed out') ),
            timeout
        );

        fetch( url, options ).then(
            response => resolve( response ),
            err => reject( err )
        ).finally( () => clearTimeout(timer) );
    })
}

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
    // console.info(`start asyncActionsMiddleware ${url} ${moment().valueOf()}`);
    fetch(url, options)
        .then(ans => new Promise((resolve, reject) => ans.ok ? resolve(ans) : ans.text().then(text => reject({message: text})))) /* if ans is ok (status between 200 and 300) than continue, otherwise get text and reject */
        .then(resultsObj => resultsObj.json())
        .then(json => {
            // console.info(`end fetch asyncActionsMiddleware ${url} ${moment().valueOf()}`);
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
