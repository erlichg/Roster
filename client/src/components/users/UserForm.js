import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class UserForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {
            user = {}
        } = props;
        this.state = {
            name: user.name,
            email: user.email,
            groups: user.groups,
            role: user.role
        }
    }
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            groups = [],
            roles = [],
            readOnly = false,
            submit = () => {},
            updateref = () => {}
        } = this.props;
        return (
            <F
                ref={e => updateref(e)}
                submit={() => submit(this.state)}
                validate={() => this.state.name && this.state.email && this.state.role}>
                <Form.Input
                    onChange={this.handleChange}
                    name="name"
                    inline
                    fluid
                    label="Name"
                    readOnly={readOnly}
                    required
                    validate="true"
                    defaultValue={this.state.name}/>
                <Form.Input
                    onChange={this.handleChange}
                    name="email"
                    inline
                    fluid
                    label="Email"
                    readOnly={readOnly}
                    required
                    validate="true"
                    defaultValue={this.state.email}/> {readOnly
                    ? <Form.Input
                            name="groups"
                            label="Groups"
                            inline
                            fluid
                            readOnly
                            defaultValue={this.state.groups
                            ? this
                                .state
                                .groups
                                .map(g => g.name)
                                .join(", ")
                            : ""}/>
                    : <Form.Select
                        onChange={this.handleChange}
                        label="Groups"
                        name="groups"
                        multiple
                        disabled={readOnly}
                        defaultValue={this.state.groups
                        ? this
                            .state
                            .groups
                            .map(g => g._id)
                        : []}
                        options={groups.map(g => {
                        return {key: g._id, text: g.name, value: g._id}
                    })}/>}
                {readOnly
                    ? <Form.Input
                            name="role"
                            label="Role"
                            inline
                            fluid
                            readOnly
                            defaultValue={this.state.role
                            ? this.state.role.name
                            : ""}/>
                    : <Form.Select
                        onChange={this.handleChange}
                        label="Role"
                        name="role"
                        validate="true"
                        required
                        disabled={readOnly}
                        defaultValue={this.state.role
                        ? this.state.role._id
                        : undefined}
                        options={roles.map(r => {
                        return {key: r._id, text: r.name, value: r._id}
                    })}/>}
            </F>
        );
    }
}

UserForm.propTypes = {
    user: PropTypes.object,
    groups: PropTypes.array,
    roles: PropTypes.array,
    readOnly: PropTypes.bool,
    submit: PropTypes.func,
    updateref: PropTypes.func
}

export default UserForm;