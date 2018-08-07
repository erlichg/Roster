import ReactTooltip from 'react-tooltip';
import {handleActions} from "redux-actions";
import {
    getobjects,
    addobject,
    removeobject,
    updateobject,
    showmodal,
    hidemodal,
    setholidays,
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
};

export const reducer = handleActions({
    [getobjects]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? action.result
            : []
    }),
    [addobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? [
                ...state[action.payload.type],
                action.result
            ]
            : state[action.payload.type]
    }),
    [removeobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? state[action.payload.type]
                .filter(o => o._id !== action.result)
            : state[action.payload.type]
    }),
    [updateobject]: (state, action) => ({
        ...state,
        [action.payload.type]: action.success
            ? state[action.payload.type]
                .map(o => o._id === action.result._id
                    ? {
                        ...o,
                        ...action.result
                    }
                    : o)
            : state[action.payload.type]
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
    })
}, defaultState);

// Middleware method to post/get data from server It runs anytime you dispatch
// an action with meta.async=true Be aware the action gets called before and
// after the middleware so expect an empty data in the action
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
