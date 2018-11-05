import React, {Component} from "react";
import PropTypes from "prop-types";
import {Label} from "semantic-ui-react";
import _ from "lodash";
import DayShift from "./DayShift-c";
import DayEvent from "./DayEvent-c";
import "./Day.css";
import EventForm from "./EventForm";
import _moment from "moment";

class Day extends Component {
    render() {
        const {
            moment,
            schedules,
            potentialschedules,
            shifts,
            holidays,
            events,
            className,
            isadmin,
        } = this.props;
        const _schedules = _.concat(schedules, potentialschedules).filter(s => s.shift.enabled && _moment(s.date).isSame(moment));
        const _shifts = shifts.filter(s => s.enabled && s.days.indexOf(moment.day()) >= 0);
        return (
            <div className={"day "+className} key={moment}>
                <Label data-tip="Click to add event" className="add" fluid="true" corner='left' icon='plus' onClick={()=>{
                    this.addEditEvent();
                }}/>
                <div className="top">
                    <h5 style={{marginLeft: '15px'}}>{moment.format("D/M")}</h5>
                    {_shifts.map(s =>
                        <DayShift key={s._id} moment={moment} shift={s} 
                        schedule={_schedules.filter(sc => sc.shift._id === s._id)[0]} 
                        />
                    )}
                </div>
                <div className="bottom">
                    {events[moment.format("D/M/Y")] && events[moment.format("D/M/Y")].filter(e=>e.type==="Vacation")
                        ? events[moment.format("D/M/Y")].filter(e=>e.type==="Vacation").map(e => <DayEvent key={e._id} event={e}/>)
                        : null}
                    {[...(holidays[moment.format("D/M/Y")] || []), ...(events[moment.format("D/M/Y")] || []).filter(e=>e.type==="Holiday")]
                        ? [...(holidays[moment.format("D/M/Y")] || []), ...(events[moment.format("D/M/Y")] || []).filter(e=>e.type==="Holiday")].map(h => {
                        if (isadmin && h.type && h.type==="Holiday") { /* Only admin can modify holidays*/
                            return <h6 key={h.name} className="userholiday" onClick={() => {
                                this.addEditEvent(h);
                            }}>{h.name}</h6>
                        } else {
                            return <h6 key={h.name} className="holiday">{h.name}</h6>
                        }
                    })
                        : null}
                </div>
            </div>

        );
    }

    addEditEvent = (event = {}) => {
        const {showmodal, hidemodal, moment, users, addevent, removeevent, isadmin, user, events} = this.props;
        if (!isadmin) { /* If regular user, can only add/delete vacation*/
            if (Object.keys(event).length>0) {
                removeevent(event._id);
            } else if (!events[moment] || !events[moment].find(e=>e.type==="Vacation" && e.user._id.toString() === user._id.toString())) { /*Only if no vacation already*/
                addevent({user: user._id.toString(), type: "Vacation", date: moment});
            }
            return;
        }
        const buttons = [
            {
                label: 'Cancel',
                className: 'btn-danger',
                callback: hidemodal
            }, 
            {
                label: 'OK',
                className: 'btn-success',
                callback: () => {
                    this
                        .form
                        .submitHandler();
                }
            }
        ];
        if (Object.keys(event).length>0) { /*Edit, so we need to add delete button*/
            buttons.unshift({
                label: 'Delete',
                className: 'btn-danger',
                callback: () => {
                    removeevent(event._id);
                    hidemodal();
                }
            })
        }
        showmodal({
            title: event.name || "New event", 
            message: 
            (<EventForm readOnly={false} updateref={e => this.form = e} users={users} event={event} isadmin={isadmin} submit={data=>{
                if (Object.keys(event).length>0) { /*Edit, so we need to remove first*/
                    removeevent(event._id);
                }
                if (events[moment] && data.type === "Vacation" && events[moment].find(e=>e.type==="Vacation" && e.user._id.toString() === data.user)) {
                    /* We already have a vaction for this user on this date */
                } else if (events[moment] && data.type === "Holiday" && events[moment].find(e=>e.type==="Holiday" && e.name === data.name)) { 
                    /* We already have a holiday with same name on this date */
                } else {
                    addevent({...data, date: moment, id: data.name});
                }
                hidemodal();
            }}/>),
            buttons
        });
    }
}
Day.propTypes = {
    moment: PropTypes.any.isRequired,
    user: PropTypes.object.isRequired,
    isadmin: PropTypes.bool.isRequired,
    schedules: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    potentialschedules: PropTypes.array.isRequired,
    shifts: PropTypes.array.isRequired,
    holidays: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    addevent: PropTypes.func.isRequired,
    removeevent: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
};

export default Day;
