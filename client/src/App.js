import React, {Component} from "react";
import {BrowserRouter as Router, Route, NavLink} from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import Home from "./components/home/Home-c";
import Users from "./components/users/Users-c";
import Groups from "./components/groups/Groups-c";
import Shifts from "./components/shifts/Shifts-c";
import Schedules from "./components/schedules/Schedules-c";
import Profile from "./components/profiles/Profile-c";
import Modal from "./components/modal/Modal-c";
import Constraints from "./components/constraints/Constraints-c";
import {library} from '@fortawesome/fontawesome-svg-core';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {faTrashAlt, faEdit, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import {Dropdown, Menu, Input, Message, Label} from 'semantic-ui-react';
import 'semantic-ui-offline/semantic.min.css';
import { connect } from "react-redux";
import {setuser, seterror} from "./actions";

library.add(fab, faEdit, faTrashAlt, faEllipsisV)

const Nav = props => (<NavLink exact {...props} activeClassName="active"/>);

class App extends Component {

    changeUser = () => {
        this.props.setuser(this.user.inputRef.value);
        this.user.inputRef.value = '';
    }

    render() {
        const {user, isadmin, error, dismisserror, messages} = this.props;
        if (!user) {
            return <h1>Your user does not seem to be registered in the application. Please contact the admin</h1>
        }
        const onlyAdmin = comp => isadmin ? comp : props => <label>You don't have permission to view this page</label>;
        const unread = messages.filter(m=>!m.read && m.to._id.toString()===user._id.toString()).length;
        return (
            <Router>
                <div className="App">
                    <header className="App-header">
                        <Menu secondary inverted>
                            <Menu.Item as={Nav} to={'/'}>
                                <img src={logo} className="App-logo" alt="logo"/>XtremIO Roster
                            </Menu.Item>
                            {["schedules", "constraints", "users", "groups", "shifts"].map(s => <Menu.Item key={s} name={s} as={Nav} to={`/${s}`}/>)}
                            <Menu.Menu position='right'>
                            {unread > 0 ? <Label data-place="bottom" data-tip="You have unread messages" color='red' floating>{unread}</Label> : null}
                            <Dropdown item text={user.name}>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Nav} to={{
                                        pathname: '/profile',
                                        state: {
                                            user,
                                            tab: 2
                                        }
                                    }}>                                    
                                        Messages
                                        {unread > 0 ? <Label data-place="bottom" data-tip="You have unread messages" color='red' circular>{unread}</Label> : null}
                                    </Dropdown.Item>                             
                                    {user.name === 'Guy Erlich' ? <Dropdown.Item>
                                        <Input ref={e=>this.user=e} action={{ content: 'Change', onClick: this.changeUser }} placeholder='User name' />
                                    </Dropdown.Item> : null}
                                    <Dropdown.Divider/>
                                    <Dropdown.Item href={'/logout'}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            </Menu.Menu>
                        </Menu>
                        <Message error={true} floating={true} hidden={error===undefined} onDismiss={dismisserror}>
                        <Message.Header>Error</Message.Header>
                        <p>{error}</p>
                        </Message>
                    </header>

                    <div className="container-fluid">
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/users" component={onlyAdmin(Users)}/>
                        <Route exact path="/groups" component={onlyAdmin(Groups)}/>
                        <Route exact path="/shifts" component={onlyAdmin(Shifts)}/>
                        <Route exact path="/constraints" component={onlyAdmin(Constraints)}/>
                        <Route exact path="/schedules" component={Schedules}/>
                        <Route exact path="/profile" component={Profile}/>
                        <Modal/>
                        <ReactTooltip effect="solid"/>
                    </div>
                </div>
            </Router>

        );
    }
}
const mapStateToProps = state => ({
    user: state.user,
    isadmin: state.user && state.user.role.name === 'Admin',
    error: state.error,
    messages: state.messages,
});

const mapDispatchToProps = dispatch => ({
   setuser: user => dispatch(setuser(user)),
   dismisserror: () => dispatch(seterror()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
