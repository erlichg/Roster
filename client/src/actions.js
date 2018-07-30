import { createActions } from "redux-actions";

export const { getusers, adduser, removeuser, updateuser, getgroups, addgroup, removegroup, updategroup, getshifts, addshift, removeshift, updateshift, showmodal, hidemodal } = createActions({
    GETUSERS: [
        undefined,
        () => ({ async: true, url: "/api/users", method: "get" })
    ],
    ADDUSER: [
        undefined,
        user => ({ async: true, url: "/api/users", data: user, method: "post" })
    ],
    REMOVEUSER: [
        undefined,
        id => ({async: true, url: "/api/users/"+id, method: "delete"})
    ],
    UPDATEUSER: [
        undefined,
        (id, data) => ({async:true, url: "/api/users/"+id, data, method: "put"})
    ],
    GETGROUPS: [
        undefined,
        () => ({ async: true, url: "/api/groups", method: "get" })
    ],
    ADDGROUP: [
        undefined,
        group => ({ async: true, url: "/api/groups", data: group, method: "post" })
    ],
    REMOVEUGROUP: [
        undefined,
        id => ({async: true, url: "/api/groups/"+id, method: "delete"})
    ],
    UPDATEGROUP: [
        undefined,
        (id, data) => ({async:true, url: "/api/groups/"+id, data, method: "put"})
    ],
    GETSHIFTS: [
        undefined,
        () => ({ async: true, url: "/api/shifts", method: "get" })
    ],
    ADDSHIFT: [
        undefined,
        user => ({ async: true, url: "/api/shifts", data: user, method: "post" })
    ],
    REMOVESHIFT: [
        undefined,
        id => ({async: true, url: "/api/shifts/"+id, method: "delete"})
    ],
    UPDATESHIFT: [
        undefined,
        (id, data) => ({async:true, url: "/api/shifts/"+id, data, method: "put"})
    ],
    SHOWMODAL: modaloptions => ({buttons:[], title: 'Title', message: '', ...modaloptions}),
    HIDEMODAL: undefined,
});
