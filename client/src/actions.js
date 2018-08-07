import {createActions} from "redux-actions";

export const {
    getobjects,
    addobject,
    removeobject,
    updateobject,
    showmodal,
    hidemodal,
    setholidays,
} = createActions({
    GETOBJECTS: type => ({
        type,
        async: true,
        url: "/api/" + type,
        method: "get"
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
});
