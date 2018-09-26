import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import {Checkbox, Input} from 'semantic-ui-react';
import {HuePicker} from 'react-color';
import ShiftForm from "./ShiftForm";

export const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
export const WEEK = [
    0,
    1,
    2,
    3,
    4,
    5,
    6
];
export const WORKWEEK = [0, 1, 2, 3, 4];
export const WEEKEND = [5, 6];

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
                Header: "Group",
                accessor: "group.name"
            }, {
                Header: "Weight",
                accessor: "",
                Cell: row => {
                    const {_id, weight} = row.value;
                    return (
                    <Input style={{width: '60px'}} type="number" defaultValue={weight} onChange={e=>{
                    props.updateshift(_id, {
                        weight: e.target.value,
                    })
                    }}/>
                )}
            }, {
                Header: "Enabled",
                accessor: "",
                Cell: row => {
                    const {_id, enabled} = row.value;
                    return <Checkbox
                        toggle
                        defaultChecked={enabled}
                        onChange={e => {
                        props.updateshift(_id, {
                            enabled: !enabled
                        });
                    }}/>;
                }
            }, {
                Header: "Color",
                accessor: "",
                Cell: row => {
                    const {_id, color} = row.value;
                    return <HuePicker
                    width="100%"
                        color={color}
                        onChangeComplete={c => {
                        props.updateshift(_id, {color: c.hex})
                    }}/>
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
        const {addshift, updateshift, showmodal, hidemodal, groups} = this.props;

        showmodal({
            title,
            message: <ShiftForm
                updateref={e => this.form = e}
                shift={shift}
                groups={groups}
                submit={data => {
                let days = [];
                if (data.days === 1) {
                    days = WEEK;
                } else if (data.days === 2) {
                    days = WORKWEEK;
                } else if (data.days === 3) {
                    days = WEEKEND;
                } else if (data.days === 4) {
                    days = data.cSelected;
                }
                data.days=  days;
                if (Object.keys(shift).length > 0) {/*edit mode*/
                    const update = {
                        ...shift,
                        ...data
                    };
                    if (!_.isEqual(update, shift)) {
                        updateshift(shift._id, data)
                    }
                } else {
                    addshift(data);
                }
                hidemodal();
            }}/>,
            buttons: [
                {
                    label: 'Cancel',
                    callback: hidemodal
                }, {
                    label: 'OK',
                    callback: () => this
                        .form
                        .submitHandler()

                }
            ]
        })
    }
}
Shifts.propTypes = {
    shifts: PropTypes.array.isRequired,
    addshift: PropTypes.func.isRequired,
    removeshift: PropTypes.func.isRequired,
    updateshift: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
}

export default Shifts;