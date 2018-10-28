import { connect } from "react-redux";
import {setmoment} from "../../actions";
import Calendar from "./Calendar";

const mapStateToProps = state => ({
    moment: state.moment,
});

const mapDispatchToProps = dispatch => ({
    setmoment: m => dispatch(setmoment(m))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Calendar);
