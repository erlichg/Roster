import { connect } from "react-redux";
import { showmodal, hidemodal, addevent, removeevent } from "../../actions";
import DayEvent from "./DayEvent";

const mapStateToProps = state => ({
    events: state.events,
    user: state.user,
    isadmin: state.user.role.name === 'Admin',
});

const mapDispatchToProps = dispatch => ({
    addevent: event => dispatch(addevent(event)),
    removeevent: id => dispatch(removeevent(id)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DayEvent);
