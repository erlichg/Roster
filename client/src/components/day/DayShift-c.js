import { connect } from "react-redux";
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import DayShift from "./DayShift";

const mapStateToProps = state => ({
    scheduleexceptions: state.scheduleexceptions,
    events: state.events,
});

const mapDispatchToProps = dispatch => ({
    addschedule: data => dispatch(addobject("schedules", data)),
    removeschedule: id => dispatch(removeobject("schedules", id)),
    updateschedule: (id, data) => dispatch(updateobject("schedules", id, data)),
    addscheduleexception: data => dispatch(addobject("scheduleexceptions", data)),
    removescheduleexception: id => dispatch(removeobject("scheduleexceptions", id)),
    updatescheduleexception: (id, data) => dispatch(updateobject("scheduleexceptions", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DayShift);
