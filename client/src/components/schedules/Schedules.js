import React, {Component} from "react";
import PropTypes from "prop-types";
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import "./Schedules.css";
import {DAYS} from "../shifts/Shifts";
import {DragDropContext} from 'react-dnd';
import HTML5Backend, {NativeTypes} from 'react-dnd-html5-backend';
import _Draggable from "../dragndrop/Draggable";
import Day from "../day/Day";

const Draggable = _Draggable("user");
const moment = extendMoment(Moment);

const VIEWS = {
    month: () => ({
        start: moment().startOf('week'),
        end: moment()
            .startOf('week')
            .add(4, 'week')
    }),
    week: () => ({
        start: moment().startOf('week'),
        end: moment()
            .startOf('week')
            .add(7, 'day')
    })
}

class Schedules extends Component {

    state = {
        view: VIEWS.month()
    };

    componentDidMount() {
        this
            .props
            .getschedules();
        this
            .props
            .getshifts();
        this
            .props
            .getusers();
        this
            .props
            .getgroups();
    }

    render() {
        const {schedules, shifts, users, holidays, groups} = this.props;
        const enabled_shifts = shifts.filter(s => s.enabled);
        const range = Array.from(moment.range(this.state.view.start, this.state.view.end).by('day', {excludeEnd: true}));
        const weeks = Array
            .from(moment.range(this.state.view.start, this.state.view.end).by('week', {excludeEnd: true}))
            .map(m => m.week());
        const weekschedules = schedules.filter(s => weeks.indexOf(s.week !== -1));
        return (
            <div id="schedules">
                <div id="users">
                    <h3>User list</h3>
                    {groups.map(g => <div key={g._id}>
                        <h5>{g.name}</h5>
                        <ul>
                            {users.filter(u => u.groups.map(g => g._id).indexOf(g._id) !== -1).map(u => (
                                <Draggable type="user" key={u._id} data={u}>
                                    {isDragging => (
                                        <li
                                            className={isDragging
                                            ? "dragging"
                                            : "notdragging"}>
                                            <label
                                                style={{
                                                opacity: isDragging
                                                    ? '0.4'
                                                    : '1'
                                            }}>{u.name}</label>
                                            <div className="userschedulecontainer">
                                                {weekschedules
                                                    .filter(s => s.user._id === u._id)
                                                    .map(s =>< span key = {
                                                        s._id
                                                    }
                                                    className = "userschedule" style = {{backgroundColor: s.shift.color}} > </span>)}
                                            </div>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                        </ul>
                    </div>)}
                </div>
                <div id="calendar">
                    {DAYS.map(d => <label className="header" key={d}>{d}</label>)}
                    {range.map(m => (<Day
                        key={m}
                        moment={m}
                        holidays={holidays[m] || []}
                        schedules={schedules.filter(s => s.week === m.week())}
                        shifts={enabled_shifts.filter(s => s.days.indexOf(m.day()) >= 0)}/>))}
                </div>
            </div>
        );
    }
}
Schedules.propTypes = {
    schedules: PropTypes.array.isRequired,
    getschedules: PropTypes.func.isRequired,
    addschedule: PropTypes.func.isRequired,
    removeschedule: PropTypes.func.isRequired,
    updateschedule: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    getshifts: PropTypes.func.isRequired,
    users: PropTypes.array.isRequired,
    holidays: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired
};

export const ItemTypes = {
    USER: 'user'
};

export default DragDropContext(HTML5Backend)(Schedules);
