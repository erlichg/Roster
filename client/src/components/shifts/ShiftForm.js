import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class ShiftForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {user = {}} = props;
        this.state = {
            name: user.name,
            email: user.email,
            groups: user.groups
        }
    }
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            groups = [],
            readOnly = false,
            submit = () => {},
            updateref = () => {}
        } = this.props;
        return (
            <F ref={e => updateref(e)} submit={() => submit(this.state)}>
                <Form.Input
                    onChange={this.handleChange}
                    name="name"
                    inline
                    fluid
                    label="Name"
                    readOnly={readOnly}
                    required
                    defaultValue={this.state.name}/>
                <Form.Input
                    onChange={this.handleChange}
                    name="email"
                    inline
                    fluid
                    label="Email"
                    readOnly={readOnly}
                    required
                    defaultValue={this.state.email}/>
                <Form.Select
                    onChange={this.handleChange}
                    label="Groups"
                    name="groups"
                    multiple
                    disabled={readOnly}
                    defaultValue={this.state.groups
                    ? this.state
                        .groups
                        .map(g => g._id)
                    : []}
                    options={groups.map(g => {
                    return {key: g._id, text: g.name, value: g._id}
                })}/>
            </F>
        );
    }
}

ShiftForm.propTypes = {
    user: PropTypes.object,
    groups: PropTypes.array,
    readOnly: PropTypes.bool,
    submit: PropTypes.func,
    updateref: PropTypes.func
}

export default ShiftForm;