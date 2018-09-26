import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class MessageForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {
            message = {}
        } = props;
        this.state = {
            to: message.from ? message.from._id.toString() : undefined,
            subject: message.subject || undefined,
            body: message.body || undefined,
        }
    }
    
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            users = [],
            submit = () => {},
            updateref = () => {},
            readOnly = false,
        } = this.props;
        return (
            <F ref={e => updateref(e)} submit={() => submit(this.state)} validate={() => this.state.to}>
            {readOnly ? 
                <Form.Input
                name="to"
                label="From"
                defaultValue={users.find(u=>u._id.toString()===this.state.to).name}
                inline
                fluid
                readOnly
                /> : 
                <Form.Dropdown
                onChange={this.handleChange}
                name="to"
                inline
                fluid
                selection
                label={readOnly ? "From" : "To"}
                required
                validate="true"
                options={users.map(u=>({text: u.name, value: u._id.toString()}))}
                defaultValue={this.state.to}
                disabled={readOnly}
                />}
                <Form.Input
                onChange={this.handleChange}
                name="subject"
                inline
                fluid
                label="Subject"
                defaultValue={this.state.subject}
                readOnly={readOnly}
                />
                <Form.TextArea
                onChange={this.handleChange}
                name="body"
                inline
                label=""
                defaultValue={this.state.body}
                readOnly={readOnly}
                />
                </F>
            );
        }
    }
    
    MessageForm.propTypes = {
        users: PropTypes.array,
        submit: PropTypes.func,
        updateref: PropTypes.func,
        message: PropTypes.object,
        readOnly: PropTypes.bool,
    }
    
    export default MessageForm;