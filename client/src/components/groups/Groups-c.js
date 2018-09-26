import { connect } from "react-redux";
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Groups from "./Groups";

const mapStateToProps = state => ({
    groups: state.groups,
});

const mapDispatchToProps = dispatch => ({
    addgroup: group => dispatch(addobject("groups", group)),
    removegroup: id => dispatch(removeobject("groups", id)),
    updategroup: (id, data) => dispatch(updateobject("groups", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Groups);
