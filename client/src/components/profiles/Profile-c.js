import { connect } from "react-redux";
import { withRouter } from 'react-router';
import Profile from "./Profile";

const mapStateToProps = state => ({
    user: state.user,
    groups: state.groups,
    roles: state.roles,
});

const mapDispatchToProps = dispatch => ({
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile));
