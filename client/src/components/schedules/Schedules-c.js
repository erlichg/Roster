import { connect } from "react-redux";
import { addobject, getobjects, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Schedules from "./Schedules";

const mapStateToProps = state => ({
    schedules: state.schedules,
    shifts: state.shifts,
    users: state.users,
    holidays: state.holidays,
    groups: state.groups,
});

const mapDispatchToProps = dispatch => ({
    addschedule: schedule => dispatch(addobject("schedules", schedule)),
    removeschedule: id => dispatch(removeobject("schedules", id)),
    getschedules: () => dispatch(getobjects("schedules")),
    updateschedule: (id, data) => dispatch(updateobject("schedules", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
    getshifts: () => dispatch(getobjects("shifts")),
    getusers: () => dispatch(getobjects("users")),
    getgroups: () => dispatch(getobjects("groups")),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Schedules);
