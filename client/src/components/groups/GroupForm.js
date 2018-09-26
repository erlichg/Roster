import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form} from 'semantic-ui-react';

class GroupForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {group = {}} = props;
        this.state = {
            name: group.name,
        }
    }
    handleChange = (e, {name, value}) => this.setState({[name]: value})
    render() {
        const {
            readOnly = false,
            submit = () => {},
            updateref = () => {}
        } = this.props;
        return (
            <F ref={e => updateref(e)} submit={() => submit(this.state)} validate={() => this.state.name}>
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
            </F>
        );
    }
}

GroupForm.propTypes = {
    group: PropTypes.object,
    readOnly: PropTypes.bool,
    submit: PropTypes.func,
    updateref: PropTypes.func
}

export default GroupForm;