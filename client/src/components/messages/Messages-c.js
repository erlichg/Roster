import { connect } from "react-redux";
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Messages from "./Messages";

const mapStateToProps = state => ({
    messages: state.messages,
    isadmin: state.user.role.name === 'Admin',
    users: state.users,
});

const mapDispatchToProps = dispatch => ({
    sendmessage: (from, to, subject, body) => dispatch(addobject("messages", from, to, subject, body)),
    deletemessage: id => dispatch(removeobject("messages", id)),
    updatemessage: (id, data) => dispatch(updateobject("messages", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Messages);
