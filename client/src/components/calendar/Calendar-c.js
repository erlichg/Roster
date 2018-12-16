import { connect } from "react-redux";
import {setmoment} from "../../actions";
import Calendar from "./Calendar";

const mapStateToProps = state => ({
    moment: state.moment,
    schedules: state.schedules,
    potentialschedules: state.potentialschedules,
    events: state.events,
});

const mapDispatchToProps = dispatch => ({
    setmoment: m => dispatch(setmoment(m))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Calendar);
