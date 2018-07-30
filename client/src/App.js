import React, {Component} from "react";
import {Navbar, NavbarBrand, Nav, NavItem, NavLink} from "reactstrap";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import Home from "./components/home/Home-c";
import Users from "./components/users/Users-c";
import Groups from "./components/groups/Groups-c";
import Shifts from "./components/shifts/Shifts-c";
import Schedules from "./components/schedules/Schedules-c";
import Modal from "./components/modal/Modal-c";
import {library} from '@fortawesome/fontawesome-svg-core';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {faTrashAlt, faEdit} from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip'

library.add(fab, faEdit, faTrashAlt)

class App extends Component {
    render() {
        return (
            <Router>
                <div className="App">

                    <header className="App-header">
                        <Navbar expand="md">
                            <NavbarBrand href="/">
                                <img src={logo} className="App-logo" alt="logo"/>XtremIO Roster
                            </NavbarBrand>
                            <Nav navbar>
                                <NavItem>
                                    <NavLink tag={Link} to="/schedules">Schedules</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/users">Users</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/groups">Groups</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} to="/shifts">Shifts</NavLink>
                                </NavItem>
                            </Nav>
                        </Navbar>
                    </header>

                    <div className="container-fluid">
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/users" component={Users}/>
                        <Route exact path="/groups" component={Groups}/>
                        <Route exact path="/shifts" component={Shifts}/>
                        <Route exact path="/schedules" component={Schedules}/>
                        <Modal/>
                        <ReactTooltip/>
                    </div>
                </div>
            </Router>

        );
    }
}

export default App;
