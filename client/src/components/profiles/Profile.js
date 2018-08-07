import React from "react";
import PropTypes from "prop-types";
import {Tab} from 'semantic-ui-react';
import UserForm from "../users/UserForm";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        const {history} = this.props;
        this.user = history.location.state.user;
        this.groups = history.location.state.groups;
        this.panes = [
            {
                menuItem: 'PROFILE',
                render: () => (
                    <Tab.Pane attached={false}>
                        <UserForm user={this.user} groups={this.groups} readOnly/>
                    </Tab.Pane>
                )
            }, {
                menuItem: 'CONSTRAINTS',
                render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane>
            }, {
                menuItem: 'VACATION',
                render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane>
            }
        ]
    }
    render() {
        return (
            <div style={{width: '800px', margin: '0 auto'}}>
                <h1>Hello {this.user.name}</h1>
                <Tab
                    menu={{
                    secondary: true,
                    pointing: true
                }}
                    panes={this.panes}/>
            </div>
        );
    }
}

Profile.propTypes = {
    history: PropTypes.object.isRequired
};

export default Profile;
