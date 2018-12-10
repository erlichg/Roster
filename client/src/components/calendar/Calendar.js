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


    render() {
        const {
            onrangechange = () => {},
            moment,
            setmoment
        } = this.props;
        const start = _moment.utc(moment).startOf('month').startOf('week');
        const end =  _moment.utc(moment).endOf('month').endOf('week').startOf('day');
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
                        : m.isSame(_moment.utc().startOf('day'))
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
