import React from "react";
import PropTypes from "prop-types";
import {Tab} from 'semantic-ui-react';
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import UserForm from "../users/UserForm";
import "./Profile.css";
import Calendar from "../calendar/Calendar-c";
import Messages from "../messages/Messages-c";

const moment = extendMoment(Moment);

class Profile extends React.Component {
    render() {
        const {history, user, isadmin, groups, roles} = this.props;
        const panes = [
            {
                menuItem: 'PROFILE',
                render: () => (
                    <Tab.Pane attached={false}>
                        <UserForm user={history.location.state.user} groups={groups} roles={roles} readOnly/>
                    </Tab.Pane>
                )
            }, {
                menuItem: 'VACATION',
                render: () => (
                    <Tab.Pane attached={false}>
                        <Calendar moment={moment()} user={history.location.state.user}/>
                    </Tab.Pane>
                )
            }, {
                menuItem: 'MESSAGES',
                render: () => (
                    <Tab.Pane attached={false}>
                        <Messages user={history.location.state.user}/>
                    </Tab.Pane>
                )
            }
        ]
        if (!isadmin && user._id !== history.location.state.user._id) {
            return <label>You don't have permission to view this page</label>
        }
        return (
            <div
                id="profile"
                style={{
                width: '800px',
                margin: '0 auto'
            }}>
                <h1>Hello {history.location.state.user.name}</h1>
                <Tab
                    defaultActiveIndex={history.location.state.tab || 0}
                    menu={{
                    secondary: true,
                    pointing: true
                }}
                    panes={panes}/>
            </div>
        );
    }
}

Profile.propTypes = {
    history: PropTypes.object.isRequired,
    isadmin: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    addevent: PropTypes.func.isRequired,
    removeevent: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
};

export default Profile;
