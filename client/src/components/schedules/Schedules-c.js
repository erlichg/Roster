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
    isadmin: state.user.role.name === 'Admin',
});

const mapDispatchToProps = dispatch => ({
    checkconstraint: (id, m) => dispatch(checkconstraint(id, m)),
    getconstraints: () => dispatch(getobjects("constraints")),
    autopopulate: m => dispatch(autopopulate(m)),
    clearpotentialschedules: () => dispatch(clearpotentialschedules()),
    applypotentialschedules: potentialschedules => {
        dispatch(addobject("schedules", potentialschedules));
        dispatch(clearpotentialschedules());
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Schedules);
