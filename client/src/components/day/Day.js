import React, {Component} from "react";
import PropTypes from "prop-types";
import {Icon} from "semantic-ui-react";
import _ from "lodash";
import DayShift from "./DayShift-c";
import DayEvent from "./DayEvent-c";
import "./Day.css";

class Day extends Component {
    render() {
        const {
            moment,
            schedules,
            potentialschedules,
            shifts,
            holidays,
            events,
            addevent,
            user,
            className,
            showtypes,
            allowedactions,
        } = this.props;
        const _schedules = _.concat(schedules, potentialschedules).filter(s => s.week === moment.week() && s.year === moment.year());
        const _shifts = shifts.filter(s => s.enabled && s.days.indexOf(moment.day()) >= 0);
        return (
            <div className={"day "+className} key={moment}>
                <div className="top">
                    <h5>{moment.format("D/M")}</h5>
                    {showtypes.shifts ? _shifts.map(s => {
                        const match = _schedules.filter(sc => sc.shift._id === s._id);
                        const schedule = match.length === 0
                            ? undefined
                            : match[0];
                        return <DayShift key={s._id} moment={moment} shift={s} schedule={schedule}/>
                    }) : null}
                </div>
                {allowedactions.addevent && (!events[moment] || events[moment]
                    .filter(e => e.user._id === user._id)
                    .length === 0)/*Only if addevent is present and user does not already have event for today*/
                    ? <div className="middle onlyonhover">
                            <Icon
                                name="add square"
                                size="huge"
                                onClick={() => addevent({user: user._id, date: moment, type: 'Vacation'})}/>
                        </div>
                    : null}
                <div className="bottom">
                    {showtypes.events && events[moment]
                        ? events[moment].map(e => <DayEvent user={user} key={e._id} event={e}/>)
                        : null}
                    {showtypes.holidays && holidays[moment]
                        ? holidays[moment].map(h => <h6 key={h.name} className="holiday">{h.name}</h6>)
                        : null}
                </div>
            </div>

        );
    }
}
Day.propTypes = {
    moment: PropTypes.any.isRequired,
    /*regular prop*/
    user: PropTypes.object.isRequired,
    /*regular prop*/
    schedules: PropTypes.array.isRequired,
    potentialschedules: PropTypes.array.isRequired,
    shifts: PropTypes.array.isRequired,
    holidays: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    addevent: PropTypes.func.isRequired,
    removeevent: PropTypes.func.isRequired,
    className: PropTypes.string.isRequired,
    showtypes: PropTypes.object.isRequired,
    allowedactions: PropTypes.object.isRequired,
};

export default Day;
