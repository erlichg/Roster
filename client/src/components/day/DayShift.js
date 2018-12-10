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

    /**
     * Checks weather this shift is valid
     */
    isValid = () => {
        const actual = this.props.exception || this.props.schedule;
        if (!actual) { /* No schedules */
            return true;
        }
        if ((this
            .props
            .events[this.props.moment] || []).filter(e=>e.type==="Unavailability").length===0) { /* No vacations today */
                return true;
         }
        return !(this
            .props
            .events[this.props.moment] || []).filter(e=>e.type==="Unavailability")
            .find(e => e.user._id === actual.user._id); /* Check wether schedule user has a vacation today */
    }

    canDrop = item => {
        const startWeek = moment(this.props.moment).startOf('week');
        const endWeek = moment(this.props.moment).endOf('week');
        const shiftdays = Array
            .from(moment.range(startWeek, endWeek).by('day'))
            .filter(m => this.props.shift.days.indexOf(m.day()) >= 0);
        return this.props.shift.group /*This shift has a group*/
        && item.groups.map(g => g._id).indexOf(this.props.shift.group._id) !== -1 /*The user belongs to the shift group*/
        && !shiftdays.find(day=>this.props.events[day] && this.props.events[day].filter(e=>e.type==="Unavailability") && this.props.events[day].filter(e=>e.type==="Unavailability").find(e=>e.user._id===item._id)) /*User does not have vacation in shift days*/
    }

    render() {
        const {
            schedules,
            moment,
            shift,
            schedule,
            addschedule,
            updateschedule,
            removeschedule,
            showmodal,
            hidemodal,
            isadmin,
        } = this.props;
        return <Droppable
            onDrop={user => {
            if (!this.canDrop(user)) {
                return;
            }
            showmodal({
                title: "Scope",
                message: "Do you want to modify this day only or entire shift?",
                buttons: [
                    {
                        label: 'Today only',
                        className: 'btn-success',
                        callback: () => {
                            hidemodal();
                            if (schedule) {
                                updateschedule(schedule._id, {
                                    date: moment,
                                    shift: shift._id,
                                    user: user._id
                                });
                            } else {/*New*/
                                addschedule({
                                    date: moment,
                                    shift: shift._id,
                                    user: user._id
                                });
                            }
                        }
                    }, {
                        label: 'Entire shift',
                        className: 'btn-success',
                        callback: () => {
                            hidemodal();
                            // remove all schedule exceptions for this shift if any
                            const dates = shift.days.map(d=>Moment(moment).day(d));
                            dates.forEach(date=>{
                                const sc = schedules.find(sc=>date.isSame(Moment(sc.date)) && sc.shift._id.toString()===shift._id.toString());
                                if (sc) {
                                    updateschedule(sc._id, {
                                        date,
                                        shift: shift._id,
                                        user: user._id
                                    });
                                } else {
                                    addschedule({
                                        date,
                                        shift: shift._id,
                                        user: user._id
                                    });
                                }
                            });
                        }
                    }
                ]
            })
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
                    {schedule && isadmin
                        ? <Icon
                                name="trash"
                                className="delete"
                                onClick={() => {
                                    showmodal({
                                        title: "Scope",
                                        message: "Do you want to delete this day only or entire shift?",
                                        buttons: [
                                            {
                                                label: 'Today only',
                                                className: 'btn-success',
                                                callback: () => {
                                                    hidemodal();
                                                    removeschedule(schedule._id, );
                                                }
                                            }, {
                                                label: 'Entire shift',
                                                className: 'btn-success',
                                                callback: () => {
                                                    hidemodal();
                                                    // remove all schedule exceptions for this shift if any
                                                    const dates = shift.days.map(d=>Moment(moment).day(d));
                                                    dates.forEach(date=>{
                                                        const sc = schedules.find(sc=>date.isSame(Moment(sc.date)) && sc.shift._id.toString() === shift._id.toString());
                                                        if (sc) {
                                                            removeschedule(sc._id);
                                                        }
                                                    });
                                                }
                                            }
                                        ]
                                    })
                            }}/>
                        : null}
                    {this.isValid()
                        ? null
                        : <Icon name="exclamation triangle" className="notvalid" data-tip={`User ${this.props.actual.user.name} is on vacation`}/>
}
                </span>
            }
}
        </Droppable>

    }
}
DayShift.propTypes = {
    schedules: PropTypes.array.isRequired,
    addschedule: PropTypes.func.isRequired,
    removeschedule: PropTypes.func.isRequired,
    updateschedule: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    shift: PropTypes.object.isRequired,
    schedule: PropTypes.object,
    moment: PropTypes.any.isRequired,
    events: PropTypes.object.isRequired,
    isadmin: PropTypes.bool.isRequired,
};

export default DayShift;
