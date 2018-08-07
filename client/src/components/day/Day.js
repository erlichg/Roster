import React, {Component} from "react";
import PropTypes from "prop-types";
import DayShift from "./DayShift-c";
import "./Day.css";

class Day extends Component {
    render() {
        const {moment, schedules, shifts, holidays} = this.props;
        return (
            <div className="day" key={moment}>
                <h5>{moment.format("D/M")}</h5>
                {shifts.map(s => {
                    const match = schedules.filter(sc => sc.shift._id === s._id);
                    const schedule = match.length === 0
                        ? undefined
                        : match[0];
                    return <DayShift key={s._id} moment={moment} shift={s} schedule={schedule}/>
                })}
                <h6 className = "holiday" >{holidays.join(', ')}</h6>
            </div>
        );
    }
}
Day.propTypes = {
    moment: PropTypes.any.isRequired,
    schedules: PropTypes.array.isRequired,
    shifts: PropTypes.array.isRequired
};

export default Day;
