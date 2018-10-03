import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class EventForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {
            event = {}
        } = props;
        this.state = {
            user: event.user ? event.user._id.toString() : undefined,
            type: event.type || undefined,
            name: event.name || undefined,
        }
    }
    
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            users = [],
            submit = () => {},
            updateref = () => {},
        } = this.props;
        return (
            <F ref={e => updateref(e)} submit={() => submit(this.state)} validate={() => this.state.type && ((this.state.type==="Holiday" && this.state.name) || (this.state.type==="Vacation" && this.state.user))}>
            <Form.Dropdown
                onChange={this.handleChange}
                name="type"
                inline
                fluid
                selection
                label="Type"
                required
                validate="true"
                options={[{text: "Holiday", value: "Holiday"}, {text: "Vacation", value: "Vacation"}]}
                defaultValue={this.state.type}
            />
            {this.state.type==="Vacation" ? 
            <Form.Dropdown
                onChange={this.handleChange}
                name="user"
                inline
                fluid
                selection
                label="User"
                required
                validate="true"
                options={users.map(u=>({text: u.name, value: u._id.toString()}))}
                defaultValue={this.state.user ? users.find(u=>u._id.toString()===this.state.user).name : undefined}
            /> 
            : 
            this.state.type==="Holiday" ?
            <Form.Input
            onChange={this.handleChange}
                name="name"
                inline
                fluid
                label="Name"
                required
                validate="true"
                defaultValue={this.state.name}
            />
            : null
            }
            </F>
        );
    }
}
    
EventForm.propTypes = {
    users: PropTypes.array,
    submit: PropTypes.func,
    updateref: PropTypes.func,
    event: PropTypes.object,
}
    
export default EventForm;