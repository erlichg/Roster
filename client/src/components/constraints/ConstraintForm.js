import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class ConstraintForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {
            constraint = {}
        } = props;
        this.state = {
            name: constraint.name,
            groups: constraint.groups,
            type: constraint.type,
            severity: constraint.severity
        }
    }
    
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            groups = [],
            readOnly = false,
            submit = () => {},
            updateref = () => {},
            constrainttypes = {},
        } = this.props;
        return (
            <F ref={e => updateref(e)} submit={() => submit(this.state)} validate={() => this.state.name && this.state.type && this.state.severity}>
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
                <Form.Select
                    onChange={this.handleChange}
                    label="Groups"
                    name="groups"
                    disabled={readOnly}
                    multiple
                    defaultValue={this.state.groups ? this.state.groups.map(g=>g._id) : undefined}
                    options={groups.map(g => ({key: g._id, text: g.name, value: g._id}))
                }/>
                <Form.Select
                    onChange={this.handleChange}
                    name="severity"
                    inline
                    label="Severity"
                    disabled={readOnly}
                    required
                    validate="true"
                    defaultValue={this.state.severity}
                    options={["Info", "Warning", "Error"].map(o=>({key: o, text: o, value: o}))}/> 
                <Form.Select
                    onChange={this.handleChange}
                    name="type"
                    inline
                    label="Type"
                    disabled={readOnly}
                    required
                    validate="true"
                    defaultValue={this.state.type}
                    options={Object.keys(constrainttypes).map(o=>({key: o, text: constrainttypes[o].label, value: o}))}/> 
            </F>
        );
    }
}

ConstraintForm.propTypes = {
    constraint: PropTypes.object,
    groups: PropTypes.array,
    constrainttypes: PropTypes.object,
    readOnly: PropTypes.bool,
    submit: PropTypes.func,
    updateref: PropTypes.func
}

export default ConstraintForm;