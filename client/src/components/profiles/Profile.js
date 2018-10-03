import React from "react";
import PropTypes from "prop-types";
import {Tab} from 'semantic-ui-react';
import UserForm from "../users/UserForm";
import "./Profile.css";
import Calendar from "../calendar/Calendar-c";
import Messages from "../messages/Messages-c";

class Profile extends React.Component {
    render() {
        const {history, user, groups, roles} = this.props;
        const panes = [
            {
                menuItem: 'PROFILE',
                render: () => (
                    <Tab.Pane attached={false}>
                        <UserForm groups={groups} user={user} roles={roles} readOnly/>
                    </Tab.Pane>
                )
            }, {
                menuItem: 'VACATION',
                render: () => (
                    <Tab.Pane attached={false}>
                        <Calendar/>
                    </Tab.Pane>
                )
            }, {
                menuItem: 'MESSAGES',
                render: () => (
                    <Tab.Pane attached={false}>
                        <Messages/>
                    </Tab.Pane>
                )
            }
        ]
        return (
            <div
                id="profile"
                style={{
                width: '800px',
                margin: '0 auto'
            }}>
                <h1>Hello {user.name}</h1>
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
    user: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
};

export default Profile;
