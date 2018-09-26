import React, {Component} from "react";
import PropTypes from "prop-types";
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import {List, Button, Dimmer, Loader} from 'semantic-ui-react';
import _ from "lodash";
import "./Schedules.css";
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _Draggable from "../dragndrop/Draggable";
import Calendar from "../calendar/Calendar-c";

const Draggable = _Draggable("user");
const _moment = extendMoment(Moment);

class Schedules extends Component {

    componentDidMount() {
        this
            .props
            .getconstraints();
    }

    componentDidUpdate() {
        const {constraints, constraintsresults, checkconstraint} = this.props;
        constraints
            .filter(c => c.enabled && !constraintsresults[c._id])
            .forEach(c => checkconstraint(c._id));
    }

    render() {
        const {
            schedules,
            potentialschedules,
            users,
            groups,
            user,
            moment,
            constraintsresults,
            constraints,
            autopopulate,
            clearpotentialschedules,
            applypotentialschedules,
            busy,
        } = this.props;
        const weeks = _.range(
            _moment(moment)
                .startOf("month")
                .week(),
            _moment(moment)
                .endOf("month")
                .week() + 1
        );
        const weekschedules = _.concat(schedules, potentialschedules).filter(s => s.shift.enabled && weeks.indexOf(s.week) !== -1 && s.year === moment.year());
        return (
            <div id="schedules">
            <Dimmer active={busy}><Loader/></Dimmer>
                <div id="users">
                    <h3>User list</h3>
                    {groups.map(g => <div key={g._id}>
                        <h5>{g.name}</h5>
                        <ul>
                            {users.filter(u => u.groups.map(g => g._id).indexOf(g._id) !== -1).map(u => (
                                <Draggable key={u._id} data={u}>
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
                                                    .map(s =>_.range(0,s.shift.weight).map((t,i)=><span key={i}
                                                    className = "userschedule" style = {{backgroundColor: s.shift.color}}/>))}
                                            </div>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                        </ul>
                    </div>)}
                    <h4>Constraints</h4>
                    <List>
                        {constraints.map(c => {
                            const className = (c.enabled
                                ? ""
                                : "disabled") + (constraintsresults[c._id]
                                ? constraintsresults[c._id].status === 0
                                    ? " ok"
                                    : (" " + c.severity)
                                : " loading");
                            let icon = "";
                            let tooltip;
                            if (c.enabled) {
                                if (!constraintsresults[c._id]) {
                                    icon = "spinner";
                                    tooltip = "Loading...";
                                } else {
                                    if (constraintsresults[c._id].status === 0) {
                                        icon = "check circle";
                                        tooltip = "Constraint is OK";
                                    } else {
                                        switch (c.severity) {
                                            case "Info":
                                                icon = "info circle";
                                                break;
                                            case "Warning":
                                                icon = "exclamation circle";
                                                break;
                                            case "Error":
                                                icon = "times circle";
                                                break;
                                            default:
                                                break;
                                        };
                                        tooltip = `${c.severity}: ${constraintsresults[c._id].error}`;
                                    }
                                }
                            }

                            return (
                                <List.Item
                                    key={c._id}
                                    data-html={true}
                                    data-tip={tooltip}
                                    className={className}>
                                    <List.Icon name={icon}/>
                                    <List.Content>{c.name}</List.Content>
                                </List.Item>
                            );
                        })}
                    </List>
                    <div id="actions">
                    <h4>Actions</h4>
                    <Button onClick={autopopulate}>Auto arrange</Button>
                    {potentialschedules.length>0
                        ? [
                        <Button negative key="revert" onClick={clearpotentialschedules}>Revert</Button>,
                        <Button positive key="apply" onClick={() => applypotentialschedules(potentialschedules)}>Apply</Button>
                        ]
                        : null}
                    </div>
                </div>
                <div className="calendar">
                    <Calendar
                        user={user}
                        allowedactions={{
                        addevent: false
                    }}/>
                </div>
            </div>
        );
    }
}
Schedules.propTypes = {
    schedules: PropTypes.array.isRequired,
    potentialschedules: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    groups: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    moment: PropTypes.any.isRequired,
    constraints: PropTypes.array.isRequired,
    constraintsresults: PropTypes.object.isRequired,
    checkconstraint: PropTypes.func.isRequired,
    getconstraints: PropTypes.func.isRequired,
    autopopulate: PropTypes.func.isRequired,
    clearpotentialschedules: PropTypes.func.isRequired,
    applypotentialschedules: PropTypes.func.isRequired,
    busy: PropTypes.bool.isRequired,
};

export default DragDropContext(HTML5Backend)(Schedules);
