import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import "./Calendar.css";
import {DAYS} from "../shifts/Shifts";
import Day from "../day/Day-c";
import {Icon, Button} from "semantic-ui-react";
import Moment from 'moment';
import {extendMoment} from 'moment-range';

const _moment = extendMoment(Moment);

class Calendar extends PureComponent {

    state = {
        moment: this.props.moment,
        start: this.firstSundayOfMonth(this.props.moment),
        end: this.lastSaturdayOfMonth(this.props.moment)
    };

    firstSundayOfMonth(date) {
        let m = _moment(date).startOf('month');
        while (m.day() !== 0) {
            m = m.subtract(1, 'days');
        }
        return m;
    }

    lastSaturdayOfMonth(date) {
        let m = _moment(date).endOf('month');
        while (m.day() !== 6) {
            m = m.add(1, 'days');
        }
        return m;
    }

    render() {
        const {
            onrangechange = () => {},
            moment,
            setmoment
        } = this.props;
        const start = this.firstSundayOfMonth(moment);
        const end = this.lastSaturdayOfMonth(moment);
        const range = Array.from(_moment.range(start, end).by('day'));
        onrangechange(start, end);
        return (
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
                    {range.map(m => (<Day
                        key={m}
                        moment={m}
                        className={m.month() !== moment.month()
                        ? "out"
                        : m.isSame(_moment().startOf('day'))
                            ? "today"
                            : ""}
                        />))}
                </div>
            </div>
        );
    }
}
Calendar.propTypes = {
    onrangechange: PropTypes.func,
    moment: PropTypes.any.isRequired,
    setmoment: PropTypes.func.isRequired
};

export default Calendar;
