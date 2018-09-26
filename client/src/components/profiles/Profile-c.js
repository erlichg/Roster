import { connect } from "react-redux";
import { withRouter } from 'react-router';
import Profile from "./Profile";
import {addevent, removeevent} from "../../actions";

const mapStateToProps = state => ({
    holidays: state.holidays,
    events: state.events,
    user: state.user,
    isadmin: state.user.role.name === 'Admin',
    groups: state.groups,
    roles: state.roles,
});

const mapDispatchToProps = dispatch => ({
   addevent: data => dispatch(addevent(data)),
   removeevent: id => dispatch(removeevent(id)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile));
