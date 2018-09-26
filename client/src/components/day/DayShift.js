import React, {Component} from "react";
import PropTypes from "prop-types";
import {Icon} from 'semantic-ui-react';
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import _Droppable from "../dragndrop/Droppable";
import "./DayShift.css";

const Droppable = _Droppable(["user"])
const moment = extendMoment(Moment);

class DayShift extends Component {

    toggleHover = toggle => {
        const x = document.getElementsByClassName("dayshift");
        var i;
        const clazz = "dayshift_" + this
            .props
            .moment
            .week() + "_" + this.props.shift._id;
        for (i = 0; i < x.length; i++) {
            if (toggle && new RegExp(`\\b${clazz}\\b`, 'g').test(x[i].className)) {
                if (x[i].classList) {
                    x[i]
                        .classList
                        .add("hover");
                } else {
                    const name = "hover";
                    const arr = x[i]
                        .className
                        .split(" ");
                    if (arr.indexOf(name) === -1) {
                        x.className += " " + name;
                    }
                }
            } else {
                if (x[i].classList) {
                    x[i]
                        .classList
                        .remove("hover");
                } else {
                    x[i].className = x[i]
                        .className
                        .replace(/\bhover\b/g, ""); // For IE9 and earlier
                }
            }
        }
    }

    isValid = () => {
        if (!this.props.schedule || !this
            .props
            .events[this.props.moment]) {
            return true;
        }
        return !this
            .props
            .events[this.props.moment]
            .find(e => e.user._id === this.props.schedule.user._id);
    }

    canDrop = item => {
        const startWeek = moment(this.props.moment).startOf('week');
        const endWeek = moment(this.props.moment).endOf('week');
        const shiftdays = Array
            .from(moment.range(startWeek, endWeek).by('day'))
            .filter(m => this.props.shift.days.indexOf(m.day()) >= 0);
        return this.props.shift.group && item
            .groups
            .map(g => g._id)
            .indexOf(this.props.shift.group._id) !== -1 && 
            !shiftdays.find(day=>this.props.events[day] && this.props.events[day].find(e=>e.user._id===item._id))
    }

    render() {
        const {
            moment,
            shift,
            schedule,
            addschedule,
            updateschedule,
            removeschedule
        } = this.props;
        return <Droppable
            onDrop={user => {
            if (!this.canDrop(user)) {
                return;
            }
            if (schedule) {/*update*/
                updateschedule(schedule._id, {
                    week: moment.week(),
                    year: moment.year(),
                    shift: shift._id,
                    user: user._id
                });
            } else {/*New*/
                addschedule({
                    week: moment.week(),
                    year: moment.year(),
                    shift: shift._id,
                    user: user._id
                });
            }
        }}>
            {(isOver, canDrop, item) => {
                this.toggleHover(isOver);
                const dropClass = canDrop
                    ? this.canDrop(item)
                        ? " candrop"
                        : " cantdrop"
                    : "";
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
                    {schedule
                        ? <Icon
                                name="trash"
                                className="delete"
                                onClick={() => {
                                removeschedule(schedule._id);
                            }}/>
                        : null}
                    {this.isValid()
                        ? null
                        : <Icon name="exclamation triangle" className="notvalid" data-tip={`User ${this.props.schedule.user.name} is on vacation`}/>
}
                </span>
            }
}
        </Droppable>

    }
}
DayShift.propTypes = {
    addschedule: PropTypes.func.isRequired,
    removeschedule: PropTypes.func.isRequired,
    updateschedule: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    shift: PropTypes.object.isRequired,
    schedule: PropTypes.object,
    moment: PropTypes.any.isRequired,
    events: PropTypes.object.isRequired
};

export default DayShift;
