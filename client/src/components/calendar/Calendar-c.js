import { connect } from "react-redux";
import {setmoment} from "../../actions";
import Calendar from "./Calendar";

const mapStateToProps = state => ({
    schedules: state.schedules,
    shifts: state.shifts,
    holidays: state.holidays,
    events: state.events,
    moment: state.moment,
});

const mapDispatchToProps = dispatch => ({
    setmoment: m => dispatch(setmoment(m))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Calendar);
