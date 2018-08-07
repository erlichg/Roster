import React, {Component} from "react";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import _Droppable from "../dragndrop/Droppable";
import "./DayShift.css";

const Droppable = _Droppable(["user"])
class DayShift extends Component {

    toggleHover = toggle => {
        const x = document.getElementsByClassName("dayshift");
        var i;
        const clazz = "dayshift_" + this.props.moment.week() + "_" + this.props.shift._id;
        for (i = 0; i < x.length; i++) {
            if (toggle && new RegExp(`\\b${clazz}\\b`, 'g').test(x[i].className)) {
                if (x[i].classList) { 
                    x[i]
                    .classList
                    .add("hover");
                } else {
                    const name = "hover";
                    const arr = x[i].className.split(" ");
                    if (arr.indexOf(name) === -1) {
                        x.className += " " + name;
                    }
                }
            } else {
                if (x[i].classList) { 
                    x[i].classList.remove("hover");
                } else {
                    x[i].className = x[i].className.replace(/\bhover\b/g, ""); // For IE9 and earlier
                }
            }
        }
    }


    canDrop = item => {
        return this.props.shift.group && item
            .groups
            .map(g => g._id)
            .indexOf(this.props.shift.group._id) !== -1;
    }

    render() {
        const {
            moment,
            shift,
            schedule,
            addschedule,
            updateschedule,
            removeschedule,
        } = this.props;
        return <Droppable
            onDrop={user => {
            if (!this.canDrop(user)) {
                return;
            }
            if (schedule) {/*update*/
                updateschedule(schedule._id, {
                    week: moment.week(),
                    shift: shift._id,
                    user: user._id
                });
            } else {/*New*/
                addschedule({
                    week: moment.week(),
                    shift: shift._id,
                    user: user._id
                });
            }
        }}>
            {(isOver, canDrop, item) => {
                this.toggleHover(isOver);
                const dropClass = canDrop ? this.canDrop(item) ? " candrop" : " cantdrop" : "";
                return <span
                    id={moment}
                    style={{
                    backgroundColor: schedule
                        ? shift.color
                        : 'lightgray'
                }}
                    onMouseEnter={() => this.toggleHover(true)}
                    onMouseLeave={() => this.toggleHover(false)}
                    data-html={true}
                    data-tip={schedule
                    ? `Shift: ${shift.name}<br>User: ${schedule.user.name}<br>Group: ${shift.group
                        ? shift.group.name
                        : 'Unassigned'}`
                    : `Shift: ${shift.name}<br>User: Unassigned<br>Group: ${shift.group
                        ? shift.group.name
                        : 'Unassigned'}`}
                    className={"dayshift_" + moment.week() + "_" + shift._id + " dayshift" + dropClass}>
                    {schedule
                        ? schedule.user.name
                        : "Empty"}
                    {schedule && isOver
                        ? <FontAwesomeIcon
                                icon="trash-alt"
                                className="delete"
                                onClick={() => {
                                removeschedule(schedule._id);
                            }}/>
                        : null}
                </span>
            }
}
        </Droppable>

    }
}
DayShift.propTypes = {
    getschedules: PropTypes.func.isRequired,
    addschedule: PropTypes.func.isRequired,
    removeschedule: PropTypes.func.isRequired,
    updateschedule: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    shift: PropTypes.object.isRequired,
    schedule: PropTypes.object,
    moment: PropTypes.any.isRequired,
    schedules: PropTypes.array.isRequired
};

export default DayShift;
