import { connect } from "react-redux";
import { addevent, removeevent } from "../../actions";
import Day from "./Day";

const mapStateToProps = state => ({
    schedules: state.schedules,
    shifts: state.shifts,
    holidays: state.holidays,
    events: state.events,
    potentialschedules: state.potentialschedules,
});

const mapDispatchToProps = dispatch => ({
    addevent: event => dispatch(addevent(event)),
    removeevent: id => dispatch(removeevent(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Day);
