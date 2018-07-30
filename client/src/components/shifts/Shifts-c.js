import { connect } from "react-redux";
import { addobject, getobjects, updateobject, removeobject, showmodal, hidemodal } from "../../actions";
import Shifts from "./Shifts";

const mapStateToProps = state => ({
    shifts: state.shifts,
});

const mapDispatchToProps = dispatch => ({
    addshift: shift => dispatch(addobject("shifts", shift)),
    removeshift: id => dispatch(removeobject("shifts", id)),
    getshifts: () => dispatch(getobjects("shifts")),
    updateshift: (id, data) => dispatch(updateobject("shifts", id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Shifts);
