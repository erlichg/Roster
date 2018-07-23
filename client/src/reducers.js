import { handleActions } from "redux-actions";
import { increment, decrement, getusers, adduser } from "./actions";

export const defaultState = { counter: 0, users: [] };

export const reducer = handleActions(
    {
        [increment]: state => ({ ...state, counter: state.counter + 1 }),
        [decrement]: state => ({ ...state, counter: state.counter - 1 }),
        [getusers]: (state, payload) => ({
            ...state,
            users: payload.payload || []
        }),
        [adduser]: (state, payload) => ({
            ...state,
            users: payload.payload._id
                ? [...state.users, payload.payload]
                : state.users
        })
    },
    defaultState
);

// Middleware method to post/get data from server
// It runs anytime you dispatch an action with meta.async=true
// Be aware the action gets called before and after the middleware so expect an empty data in the action
export const asyncActionsMiddleware = store => next => action => {
    const isActionAsync = action.meta ? action.meta.async : false;
    if (!isActionAsync) {
        return next(action);
    }

    const { url, data, method } = action.meta;
    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(resultsObj => resultsObj.json())
        .then(json => {
            next({ ...action, payload: json });
        })
        .catch(err => {
            console.error(err);
        });

    return next(action);
};
