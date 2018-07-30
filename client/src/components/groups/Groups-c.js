import { connect } from "react-redux";
import { addgroup, getgroups, removegroup, updategroup, showmodal, hidemodal } from "../../actions";
import Groups from "./Groups";

const mapStateToProps = state => ({
    groups: state.groups
});

const mapDispatchToProps = dispatch => ({
    addgroup: group => dispatch(addgroup(group)),
    removegroup: id => dispatch(removegroup(id)),
    getgroups: () => dispatch(getgroups()),
    updategroup: (id, data) => dispatch(updategroup(id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Groups);
