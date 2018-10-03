import { connect } from "react-redux";
import { addevent, removeevent, showmodal, hidemodal } from "../../actions";
import Day from "./Day";

const mapStateToProps = state => ({
    schedules: state.schedules,
    shifts: state.shifts,
    holidays: state.holidays,
    events: state.events,
    potentialschedules: state.potentialschedules,
    users: state.users,
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
)(Day);
