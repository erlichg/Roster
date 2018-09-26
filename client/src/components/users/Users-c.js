import { connect } from "react-redux";
import { withRouter } from 'react-router';
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Users from "./Users";

const mapStateToProps = state => ({
    users: state.users,
    groups: state.groups,
    roles: state.roles,
    user: state.user,
    isadmin: state.user.role.name === 'Admin'
});

const mapDispatchToProps = dispatch => ({
    adduser: user => dispatch(addobject("users", user)),
    removeuser: id => dispatch(removeobject("users", id)),
    updateuser: (id, data) => dispatch(updateobject("users", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Users));
