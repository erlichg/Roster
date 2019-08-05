import React, {Component} from "react";
import PropTypes from "prop-types";
import {Label, Header, Button, Popup, Grid} from "semantic-ui-react";
import DayShift from "./DayShift-c";
import DayEvent from "./DayEvent-c";
import "./Day.css";
import EventForm from "./EventForm";
import equal from "deep-equal";

class Day extends Component {
    
    shouldComponentUpdate(nextProps, nextState) {
        // if (this.props.schedule.length === nextProps.schedule.length && this.props.events.length === nextProps.events.length) {
            if (equal(this.props.schedules, nextProps.schedules) && equal(this.props.events, nextProps.events)) {
                return false;
            }
        // }
        return true;
    }

    render() {        
        const {
            moment,
            schedules,
            shifts,
            holidays,
            events,
            className,
            isadmin,
        } = this.props;
        // console.info(`start day ${moment.format("D/M/Y")} render ${_moment().valueOf()}`);
        const _shifts = shifts.filter(s => s.enabled && s.days.indexOf(moment.day()) >= 0);
        const _unavailabilities = events.filter(e=>e.type==="Unavailability");
        const ans =  (
            <div className={"day "+className} key={moment}>
                <Label data-tip={isadmin ? "Click to add event" : "Click to add unavailability"} className="add" fluid="true" corner='left' icon='plus' onClick={()=>{
                    this.addEditEvent();
                }}/>
                <div className="top">
                    <h5 style={{marginLeft: '15px'}}>{moment.format("D/M")}</h5>
                    {_shifts.map(s =>
                        <DayShift key={s._id} moment={moment} shift={s} 
                        schedule={schedules.filter(sc => sc.shift._id === s._id)[0]} 
                        />
                    )}
                </div>
                <div className="bottom">
                    {_unavailabilities.length > 0 ?
                    <Popup style={{padding: 3}} trigger={<Button>{_unavailabilities.length + " Unavailabilities"}</Button>} flowing hoverable>
                        <Popup.Content>
                            {_unavailabilities.map(e => <DayEvent key={e._id} event={e}/>)}
                        </Popup.Content>
                    </Popup> : null}
                    {[...(holidays[moment.format("D/M/Y")] || []), ...events.filter(e=>e.type==="Holiday")]
                        ? [...(holidays[moment.format("D/M/Y")] || []), ...events.filter(e=>e.type==="Holiday")].map(h => {
                        if (isadmin && h.type && h.type==="Holiday") { /* Only admin can modify holidays*/
                            return <h4 key={h.name} className="userholiday" onClick={() => {
                                this.addEditEvent(h);
                            }}>{h.name}</h4>
                        } else {
                            return <h4 key={h.name} className="holiday">{h.name}</h4>
                        }
                    })
                        : null}
                </div>
            </div>

        );
        // console.info(`end day ${moment.format("D/M/Y")} render ${_moment().valueOf()}`);
        return ans;
    }

    addEditEvent = (event = {}) => {
        const {showmodal, hidemodal, moment, users, addevent, removeevent, isadmin, user, events} = this.props;
        if (!isadmin) { /* If regular user, can only add/delete vacation*/
            if (Object.keys(event).length>0) {
                removeevent(event._id);
            } else if (!events.find(e=>e.type==="Unavailability" && e.user._id.toString() === user._id.toString())) { /*Only if no vacation already*/
                addevent({user: user._id.toString(), type: "Unavailability", date: moment});
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
                if (data.type === "Unavailability" && events.find(e=>e.type==="Unavailability" && e.user._id.toString() === data.user)) {
                    /* We already have a vaction for this user on this date */
                } else if (data.type === "Holiday" && events.find(e=>e.type==="Holiday" && e.name === data.name)) { 
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
    shifts: PropTypes.array.isRequired,
    holidays: PropTypes.object.isRequired,
    events: PropTypes.array.isRequired,
    addevent: PropTypes.func.isRequired,
    removeevent: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
};

export default Day;
