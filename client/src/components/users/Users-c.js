import { connect } from "react-redux";
import { withRouter } from 'react-router';
import { getobjects, addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Users from "./Users";

const mapStateToProps = state => ({
    users: state.users,
    groups: state.groups
});

const mapDispatchToProps = dispatch => ({
    adduser: user => dispatch(addobject("users", user)),
    removeuser: id => dispatch(removeobject("users", id)),
    getusers: () => dispatch(getobjects("users")),
    updateuser: (id, data) => dispatch(updateobject("users", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
    getgroups: () => dispatch(getobjects("groups")),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Users));
