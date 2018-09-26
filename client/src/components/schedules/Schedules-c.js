import { connect } from "react-redux";
import Schedules from "./Schedules";
import {checkconstraint, getobjects, autopopulate, clearpotentialschedules, addobject} from "../../actions";

const mapStateToProps = state => ({
    schedules: state.schedules,
    potentialschedules: state.potentialschedules,
    users: state.users,
    groups: state.groups,
    user: state.user,
    moment: state.moment,
    constraints: state.constraints,
    constraintsresults: state.constraintsresults,
    busy: state.busy,
});

const mapDispatchToProps = dispatch => ({
    checkconstraint: id => dispatch(checkconstraint(id)),
    getconstraints: () => dispatch(getobjects("constraints")),
    autopopulate: () => dispatch(autopopulate()),
    clearpotentialschedules: () => dispatch(clearpotentialschedules()),
    applypotentialschedules: potentialschedules => {
        potentialschedules.forEach(s=>dispatch(addobject("schedules", s)));
        dispatch(clearpotentialschedules());
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Schedules);
