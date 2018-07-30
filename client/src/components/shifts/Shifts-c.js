import { connect } from "react-redux";
import { addshift, getshifts, removeshift, updateshift, showmodal, hidemodal } from "../../actions";
import Shifts from "./Shifts";

const mapStateToProps = state => ({
    shifts: state.shifts,
});

const mapDispatchToProps = dispatch => ({
    addshift: shift => dispatch(addshift(shift)),
    removeshift: id => dispatch(removeshift(id)),
    getshifts: () => dispatch(getshifts()),
    updateshift: (id, data) => dispatch(updateshift(id, data)),
    showmodal: children => dispatch(showmodal(children)),
    hidemodal: () => dispatch(hidemodal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Shifts);
