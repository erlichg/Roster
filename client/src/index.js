import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import { reducer, defaultState, asyncActionsMiddleware, reactTooltipMiddleWare } from "./reducers";
import "bootstrap/dist/css/bootstrap.min.css";

const store = createStore(
    reducer,
    defaultState,
    applyMiddleware(asyncActionsMiddleware, reactTooltipMiddleWare)
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);
// registerServiceWorker();
