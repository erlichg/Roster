import { connect } from "react-redux";
import Constraints from "./Constraints";
import {addobject, removeobject, updateobject, showmodal, hidemodal} from "../../actions";

const mapStateToProps = state => ({
    constraints: state.constraints,
    groups: state.groups,
    constrainttypes: state.constrainttypes,
});

const mapDispatchToProps = dispatch => ({
    addconstraint: data => dispatch(addobject("constraints", data)),
    removeconstraint: id => dispatch(removeobject("constraints", id)),
    updateconstraint: (id, data) => dispatch(updateobject("constraints", id, data)),
    showmodal: data => dispatch(showmodal(data)),
    hidemodal: () => dispatch(hidemodal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Constraints);
