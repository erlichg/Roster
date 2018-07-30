import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Dropdown} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import Form from "../form/Form";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button, ButtonGroup} from 'reactstrap';
import _ from 'lodash';

const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
const WEEK = [
    0,
    1,
    2,
    3,
    4,
    5,
    6
];
const WORKWEEK = [0, 1, 2, 3, 4];
const WEEKEND = [5, 6];

class Shifts extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "Name",
                accessor: "name"
            }, {
                Header: "Days",
                accessor: "days",
                Cell: row => {
                    if (_.isEqual(row.value, WEEK)) {
                        return "Week";
                    }
                    if (_.isEqual(row.value, WORKWEEK)) {
                        return "Work days";
                    }
                    if (_.isEqual(row.value, WEEKEND)) {
                        return "Weekend";
                    }
                    return row
                        .value
                        .map(v => DAYS[v])
                        .join(', ');
                }
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="edit"
                            data-tip="Edit this item"
                            onClick={() => this.addEditShift('Edit shift', row.value)}/>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove shift',
                                message: 'Do you really want to remove the shift?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.removeshift(row.value._id);
                                            props.hidemodal();
                                        }
                                    }
                                ]
                            })
                        }}/>
                    </div>
                )
            }
        ];
    }

    componentDidMount() {
        this
            .props
            .getshifts();
    }

    render() {
        const {shifts} = this.props;
        return (
            <div id="shifts">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addEditShift()}>
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of shifts</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={shifts}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditShift = (title = "New Shift", shift = {}) => {
        const {addshift, updateshift, showmodal, hidemodal} = this.props;
        let daysValue = shift.days ? 4 : undefined;
        if (_.isEqual(shift.days, WEEK)) {
            daysValue = 1;
        }
        if (_.isEqual(shift.days, WORKWEEK)) {
            daysValue = 2;
        }
        if (_.isEqual(shift.days, WEEKEND)) {
            daysValue = 3;
        }
        showmodal({
            state: {
                days: daysValue,
                cSelected: shift.days || [],
                onCheckboxBtnClick: function (selected) {
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
            },
            title,
            message: function () {
                return (
                    <Form ref={e => this.form = e}>
                        <div className={"form-group"}>
                            <label htmlFor={"name"}>
                                shift name
                            </label>
                            <input
                                id={"name"}
                                className={"form-control"}
                                required={true}
                                name={"name"}
                                type={"text"}
                                defaultValue={shift.name}
                                ref={e => this.name = e}/>
                            <div className="invalid-feedback"/>
                        </div>
                        <div className={"form-group"}>
                            <label htmlFor={"groups"}>
                                Groups
                            </label>
                            <div>
                                <Dropdown
                                    ref={e => this.days = e}
                                    placeholder="Days"
                                    fluid
                                    selection
                                    defaultValue={daysValue}
                                    onChange={(e, f) => {
                                    this.setState({days: f.value});
                                }}
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
                                    ? <ButtonGroup
                                            style={{
                                            paddingTop: '10px'
                                        }}>
                                            {DAYS.map((d, i) => <Button
                                                key={i}
                                                color="primary"
                                                onClick={() => this.state.onCheckboxBtnClick.bind(this)(i)}
                                                active={this
                                                .state
                                                .cSelected
                                                .includes(i)}>{d}</Button>)}
                                        </ButtonGroup>
                                    : null}
                            </div>
                            <div className="invalid-feedback"/>
                        </div>
                    </Form>
                );
            },
            buttons: [
                {
                    label: 'Cancel',
                    callback: hidemodal
                }, {
                    label: 'OK',
                    callback: function () {
                        if (this.form.validate()) {
                            let days = [];
                            if (this.state.days === 1) {
                                days = WEEK;
                            } else if (this.state.days === 2) {
                                days = WORKWEEK;
                            } else if (this.state.days === 3) {
                                days = WEEKEND;
                            } else if (this.state.days === 4) {
                                days = this.state.cSelected;
                            }
                            if (Object.keys(shift).length > 0) {/*edit mode*/
                                updateshift(shift._id, {
                                    name: this.name.value,
                                    days
                                })
                            } else {
                                addshift({name: this.name.value, days});
                            }
                            hidemodal();
                        }
                    }
                }
            ]
        })
    }
}
Shifts.propTypes = {
    shifts: PropTypes.array.isRequired,
    getshifts: PropTypes.func.isRequired,
    addshift: PropTypes.func.isRequired,
    removeshift: PropTypes.func.isRequired,
    updateshift: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired
}

export default Shifts;