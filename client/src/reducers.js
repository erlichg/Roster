import ReactTooltip from 'react-tooltip';
import {handleActions} from "redux-actions";
import {
    getusers,
    adduser,
    removeuser,
    updateuser,
    getgroups,
    addgroup,
    removegroup,
    updategroup,
    getshifts,
    addshift,
    removeshift,
    updateshift,
    showmodal,
    hidemodal,
} from "./actions";

export const defaultState = {
    counter: 0,
    users: [],
    groups: [],
    shifts: [],
    modal: false,
    modaloptions: {},
};

export const reducer = handleActions({
    [getusers]: (state, payload) => ({
        ...state,
        users: payload.success
            ? payload.result
            : []
    }),
    [adduser]: (state, payload) => ({
        ...state,
        users: payload.success
            ? [
                ...state.users,
                payload.result
            ]
            : state.users
    }),
    [removeuser]: (state, payload) => ({
        ...state,
        users: payload.success
            ? state
                .users
                .filter(u => u._id !== payload.result)
            : state.users
    }),
    [updateuser]: (state, payload) => ({
        ...state,
        users: payload.success
            ? state
                .users
                .map(u => u._id === payload.payload
                    ? {
                        ...u,
                        ...payload.result
                    }
                    : u)
            : state.users
    }),
    [getgroups]: (state, payload) => ({
        ...state,
        groups: payload.success
            ? payload.result
            : []
    }),
    [addgroup]: (state, payload) => ({
        ...state,
        groups: payload.success
            ? [
                ...state.groups,
                payload.result
            ]
            : state.users
    }),
    [removegroup]: (state, payload) => ({
        ...state,
        groups: payload.success
            ? state
                .groups
                .filter(u => u._id !== payload.result)
            : state.groups
    }),
    [updategroup]: (state, payload) => ({
        ...state,
        groups: payload.success
            ? state
                .groups
                .map(g => g._id === payload.payload
                    ? {
                        ...g,
                        ...payload.result
                    }
                    : g)
            : state.groups
    }),
    [getshifts]: (state, payload) => ({
        ...state,
        shifts: payload.success
            ? payload.result
            : []
    }),
    [addshift]: (state, payload) => ({
        ...state,
        shifts: payload.success
            ? [
                ...state.shifts,
                payload.result
            ]
            : state.shifts
    }),
    [removeshift]: (state, payload) => ({
        ...state,
        shifts: payload.success
            ? state
                .shifts
                .filter(s => s._id !== payload.result)
            : state.shifts
    }),
    [updateshift]: (state, payload) => ({
        ...state,
        shifts: payload.success
            ? state
                .shifts
                .map(s => s._id === payload.payload
                    ? {
                        ...s,
                        ...payload.result
                    }
                    : s)
            : state.shifts
    }),
    [showmodal]: (state, payload) => ({
        ...state,
        modal: true,
        modaloptions: payload.payload
    }),
    [hidemodal]: state => ({
        ...state,
        modal: false
    }),
}, defaultState);

// Middleware method to post/get data from server It runs anytime you dispatch
// an action with meta.async=true Be aware the action gets called before and
// after the middleware so expect an empty data in the action
export const asyncActionsMiddleware = store => next => action => {
    const isActionAsync = action.meta
        ? action.meta.async
        : false;
    if (!isActionAsync) {
        return next(action);
    }

    const {url, data, method} = action.meta;
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
    ReactTooltip.rebuild();
    return next(action);
}
