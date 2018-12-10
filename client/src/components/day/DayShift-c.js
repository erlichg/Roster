import { connect } from "react-redux";
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import DayShift from "./DayShift";

const mapStateToProps = state => ({
    events: state.events,
    schedules: state.schedules,
    isadmin: state.user.role.name === 'Admin',
});

const mapDispatchToProps = dispatch => ({
    addschedule: data => dispatch(addobject("schedules", data)),
    removeschedule: id => dispatch(removeobject("schedules", id)),
    updateschedule: (id, data) => dispatch(updateobject("schedules", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DayShift);
