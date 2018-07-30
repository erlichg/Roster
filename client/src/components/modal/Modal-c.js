import { connect } from "react-redux";
import {hidemodal} from "../../actions";
import Modal from "./Modal";

const mapStateToProps = state => ({modal: state.modal, modaloptions: state.modaloptions});

const mapDispatchToProps = dispatch => ({
    hidemodal: id => dispatch(hidemodal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Modal);
