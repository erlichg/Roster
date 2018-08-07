import { connect } from "react-redux";
import { addobject, getobjects, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import DayShift from "./DayShift";

const mapStateToProps = state => ({
    schedules: state.schedules
});

const mapDispatchToProps = dispatch => ({
    addschedule: group => dispatch(addobject("schedules", group)),
    removeschedule: id => dispatch(removeobject("schedules", id)),
    getschedules: () => dispatch(getobjects("schedules")),
    updateschedule: (id, data) => dispatch(updateobject("schedules", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DayShift);
