import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import "./Calendar.css";
import {DAYS} from "../shifts/Shifts";
import Day from "../day/Day-c";
import {Button, Grid} from "semantic-ui-react";
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import _ from "lodash";

const _moment = extendMoment(Moment);

class Calendar extends PureComponent {


    render() {
        // console.info(`start calendar render ${_moment().valueOf()}`);
        const {
            moment,
            setmoment,
            schedules,
            potentialschedules,
            events,
        } = this.props;
        const start = _moment.utc(moment).startOf('month').startOf('week');
        const end =  _moment.utc(moment).endOf('month').endOf('week').startOf('day');
        const weeks = Array.from(_moment.range(start, end).by('week'));
        const validschedules = _.concat(schedules, potentialschedules).filter(s => s.shift.enabled).reduce((map, schedule) => {
            if (!map[_moment(schedule.date).format("D/M/Y")]) {
                map[_moment(schedule.date).format("D/M/Y")] = [];
            }
            map[_moment(schedule.date).format("D/M/Y")].push(schedule);
            return map;
        }, {});
        const ans = (
            <div>
                <div className="calendartop">
                    <Button
                        icon="chevron left"
                        onClick={() => {
                        setmoment(_moment(moment).subtract(1, 'months'));
                    }}/>
                    <div>
                        <Button
                            onClick={() => {
                            setmoment(_moment());
                        }}>Today</Button>
                        <label>{moment.format("MMM YYYY")}</label>
                    </div>
                    <Button
                        icon="chevron right"
                        onClick={() => {
                        setmoment(_moment(moment).add(1, 'months'));
                    }}/>
                </div>
                <div id="calendar">
                    {DAYS.map(d => <label className="header" key={d}>{d}</label>)}
                    <Grid celled columns='equal'>
                        {weeks.map(w=>
                            <Grid.Row>
                                {[...Array(7).keys()].map(i => {
                                    const m = _moment(w).day(i);
                                    return <Grid.Column><Day
                        schedules={validschedules[m.format("D/M/Y")] || []}
                        events={events[m.format("D/M/Y")] || []}
                        key={m}
                        moment={m}
                        className={m.month() !== moment.month()
                        ? "out"
                        : m.isSame(_moment.utc().startOf('day'))
                            ? "today"
                            : ""}
                        /></Grid.Column>
                        })}
                            </Grid.Row>
                        )}
                    </Grid>
                </div>
            </div>
        );
        // console.info(`end calendar render ${_moment().valueOf()}`);
        return ans;
    }
}
Calendar.propTypes = {
    moment: PropTypes.any.isRequired,
    setmoment: PropTypes.func.isRequired,
    schedules: PropTypes.array.isRequired,
    potentialschedules: PropTypes.array.isRequired,
    events: PropTypes.object.isRequired,
};

export default Calendar;
