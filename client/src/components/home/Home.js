import React from "react";
import PropTypes from "prop-types";
import {Card} from 'semantic-ui-react';
import moment from "moment";

const WEEKS_TO_CHECK = 5;

class Home extends React.Component {
    areShiftsFilledForNextMonth = () => {
        const {shifts, schedules} = this.props;
        const valid_shifts_ids = shifts.filter(s => s.enabled).map(s=>s._id); /*get all enabled shifts*/
        const week = moment().week();
        for (var i=0;i<=WEEKS_TO_CHECK;i++) {  
            for (var id of valid_shifts_ids) {          
                if (!schedules.find(s=>s.week===week+i && s.shift._id===id)) {
                    return false;
                }
            }
        }
        return true;
    }

    areAllSchedulesValid = () => {
        const {schedules, events} = this.props;
        const week = moment().week();
        for (var i=0;i<=WEEKS_TO_CHECK;i++) {  
            for (var s of schedules.filter(s=>s.week===week+i)) {
                for (var day of s.shift.days) {
                    const m = moment().week(week+i).day(day).startOf('day');
                    if (events[m] && events[m].find(e=>e.user._id===s.user._id)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    newMessages = () => {
        return false;
    }

    render() {
        const {history} = this.props;
        const areShiftsFilledForNextMonth = this.areShiftsFilledForNextMonth();
        const areAllSchedulesValid = this.areAllSchedulesValid();
        const newMessages = this.newMessages();
        return (
            <div>
                <h1>Dashboard</h1>
                <Card.Group centered>
                    <Card
                        onClick={() => {
                        if (areShiftsFilledForNextMonth) {
                            return;
                        }
                        history.push({
                            pathname: "/schedules",
                        })
                    }}
                        color={areShiftsFilledForNextMonth
                        ? "green"
                        : "red"}>
                        <Card.Content>
                            <Card.Header>{areShiftsFilledForNextMonth
                                    ? ""
                                    : "Warning"}</Card.Header>
                            <Card.Meta>Schedules</Card.Meta>
                            <Card.Description>{areShiftsFilledForNextMonth
                                    ? `Schedules for next ${WEEKS_TO_CHECK} weeks are all filled`
                                    : `One or more schedules needs to be filled for next ${WEEKS_TO_CHECK} weeks`}</Card.Description>
                        </Card.Content>
                    </Card>
                    <Card
                    onClick={() => {
                        if (areAllSchedulesValid) {
                            return;
                        }
                        history.push({
                            pathname: "/schedules",
                        })
                    }}
                        color={areAllSchedulesValid
                        ? "green"
                        : "red"}>
                        <Card.Content>
                            <Card.Header>{areAllSchedulesValid
                                    ? ""
                                    : "Warning"}</Card.Header>
                            <Card.Meta>Schedules</Card.Meta>
                            <Card.Description>{areAllSchedulesValid
                                    ? `Schedules for next ${WEEKS_TO_CHECK} weeks are all valid`
                                    : `One or more schedules for next ${WEEKS_TO_CHECK} weeks are not valid`}</Card.Description>
                        </Card.Content>
                    </Card>
                    <Card
                        color={newMessages
                        ? "red"
                        : "green"}>
                        <Card.Content>
                            <Card.Header>{newMessages
                                    ? "Warning"
                                    : ""}</Card.Header>
                            <Card.Meta>Messages</Card.Meta>
                            <Card.Description>{newMessages
                                    ? "You have new messages"
                                    : "No new messages"}</Card.Description>
                        </Card.Content>
                    </Card>
                </Card.Group>
            </div>
        );
    }
}

Home.propTypes = {
    history: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
};

export default Home;
