import { connect } from "react-redux";
import { adduser, getusers, removeuser, updateuser, showmodal, hidemodal, getgroups } from "../../actions";
import Users from "./Users";

const mapStateToProps = state => ({
    users: state.users,
    groups: state.groups
});

const mapDispatchToProps = dispatch => ({
    adduser: user => dispatch(adduser(user)),
    removeuser: id => dispatch(removeuser(id)),
    getusers: () => dispatch(getusers()),
    updateuser: (id, data) => dispatch(updateuser(id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
    getgroups: () => dispatch(getgroups()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Users);
