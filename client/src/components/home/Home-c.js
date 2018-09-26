import { connect } from "react-redux";
import { withRouter } from 'react-router';
import Home from "./Home";

const mapStateToProps = state => ({
    shifts: state.shifts,
    users: state.users,
    groups: state.groups,
    events: state.events,
    schedules: state.schedules,
});

const mapDispatchToProps = dispatch => ({
    
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Home));
