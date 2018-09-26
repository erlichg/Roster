import React from "react";
import PropTypes from "prop-types";
import F from "../form/Form";
import {Form, Button} from 'semantic-ui-react';
import _ from "lodash";
import {DAYS, WEEK, WEEKEND, WORKWEEK} from "./Shifts";
import "./ShiftForm.css";

class ShiftForm extends React.PureComponent {
    constructor(props) {
        super(props);
        const {
            shift = {}
        } = props;
        let daysValue = shift.days
            ? 4
            : undefined;
        if (_.isEqual(shift.days, WEEK)) {
            daysValue = 1;
        }
        if (_.isEqual(shift.days, WORKWEEK)) {
            daysValue = 2;
        }
        if (_.isEqual(shift.days, WEEKEND)) {
            daysValue = 3;
        }
        this.state = {
            name: shift.name,
            group: shift.group,
            days: daysValue,
            cSelected: shift.days || []
        }
    }
    onCheckboxBtnClick = selected => {
        const index = this
            .state
            .cSelected
            .indexOf(selected);
        if (index < 0) {
            this
                .state
                .cSelected
                .push(selected);
        } else {
            this
                .state
                .cSelected
                .splice(index, 1);
        }
        this.setState({
            cSelected: [...this.state.cSelected]
        });
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
            <F ref={e => updateref(e)} submit={() => submit(this.state)} validate={() => this.state.name && this.state.days}>
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
                    name="days"
                    inline
                    label="Days"
                    disabled={readOnly}
                    required
                    validate="true"
                    defaultValue={this.state.days}
                    options={[
                    {
                        key: 1,
                        text: "Week",
                        value: 1
                    }, {
                        key: 2,
                        text: "Work Week",
                        value: 2
                    }, {
                        key: 3,
                        text: "Weekend",
                        value: 3
                    }, {
                        key: 4,
                        text: "Custom",
                        value: 4
                    }
                ]}/> {this.state.days === 4
                    ? <Button.Group
                            style={{
                            paddingTop: '10px'
                        }}>
                            {DAYS.map((d, i) => <Button
                                key={i}
                                className="daybutton"
                                type="button"
                                onClick={() => this.onCheckboxBtnClick(i)}
                                active={this
                                .state
                                .cSelected
                                .includes(i)}>{d}</Button>)}
                        </Button.Group>
                    : null}
                <Form.Select
                    onChange={this.handleChange}
                    label="Group"
                    name="group"
                    disabled={readOnly}
                    defaultValue={this.state.group
                    ? this.state.group._id
                    : undefined}
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