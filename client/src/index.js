import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {Provider} from "react-redux";
import {createStore, applyMiddleware} from "redux";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import {reducer, defaultState, asyncActionsMiddleware, reactTooltipMiddleWare} from "./reducers";
//import "bootstrap/dist/css/bootstrap.min.css";
import getholidays from "./holidays";
import {setholidays, getevents, getobjects, getconstrainttypes, getuser} from "./actions";

const store = createStore(reducer, defaultState, applyMiddleware(asyncActionsMiddleware, reactTooltipMiddleWare));

ReactDOM.render(
    <Provider store={store}>
    <App/>
</Provider>, document.getElementById("root"));
// registerServiceWorker();

store.dispatch(getuser());
store.dispatch(getevents());
store.dispatch(getobjects("shifts"));
store.dispatch(getobjects("schedules"));
store.dispatch(getobjects("users"));
store.dispatch(getobjects("groups"));
store.dispatch(getobjects("roles"));
store.dispatch(getobjects("constraints"));
store.dispatch(getobjects("messages"));
store.dispatch(getconstrainttypes());
getholidays().then(h => {
    store.dispatch(setholidays(h));
});
