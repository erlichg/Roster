import { connect } from "react-redux";
import { addobject, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Shifts from "./Shifts";

const mapStateToProps = state => ({
    shifts: state.shifts,
    groups: state.groups,
});

const mapDispatchToProps = dispatch => ({
    addshift: shift => dispatch(addobject("shifts", shift)),
    removeshift: id => dispatch(removeobject("shifts", id)),
    updateshift: (id, data) => dispatch(updateobject("shifts", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Shifts);
