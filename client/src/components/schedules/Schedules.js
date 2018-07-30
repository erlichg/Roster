import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Dropdown} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import Form from "../form/Form";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Schedules extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "Week",
                accessor: "week"
            }, {
                Header: "Shift",
                accessor: "shift"
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="edit"
                            data-tip="Edit this item"
                            onClick={() => this.addEditschedule('Edit schedule', row.value)}/>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove schedule',
                                message: 'Do you really want to remove the schedule?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.removeschedule(row.value._id);
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
            .getschedules();
    }

    render() {
        const {schedules} = this.props;
        return (
            <div id="schedules">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addEditschedule()}>
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of schedules</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={schedules}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditschedule = (title = "New schedule", schedule = {}) => {
        const {groups, addschedule, updateschedule, showmodal, hidemodal} = this.props;
        showmodal({
            title, message: <Form ref={e => this.form = e}>
                <div className={"form-group"}>
                    <label htmlFor={"name"}>
                        schedule name
                    </label>
                    <input
                        id={"name"}
                        className={"form-control"}
                        required={true}
                        name={"name"}
                        type={"text"}
                        defaultValue={schedule.name}
                        ref={e => this.name = e}/>
                    <div className="invalid-feedback"/>
                </div>
                <div className={"form-group"}>
                    <label htmlFor={"email"}>
                        Email
                    </label>
                    <input
                        id={"email"}
                        className={"form-control"}
                        required={true}
                        name={"email"}
                        type={"email"}
                        defaultValue={schedule.email}
                        ref={e => this.email = e}/>
                    <div className="invalid-feedback"/>
                </div>
                <div className={"form-group"}>
                    <label htmlFor={"groups"}>
                        Groups
                    </label>
                    <Dropdown
                        ref={e => this.groups = e}
                        placeholder="Groups"
                        fluid
                        multiple
                        selection
                        defaultValue={schedule.groups
                        ? schedule
                            .groups
                            .map(g => g._id)
                        : []}
                        options={groups.map(g => {
                        return {key: g._id, text: g.name, value: g._id}
                    })}/>
                    <div className="invalid-feedback"/>
                </div>
            </Form>,
            buttons: [
                {
                    label: 'Cancel',
                    className: 'btn-danger',
                    callback: hidemodal
                }, {
                    label: 'OK',
                    className: 'btn-success',
                    callback: () => {
                        if (this.form.validate()) {
                            if (Object.keys(schedule).length > 0) { //edit mode
                                updateschedule(schedule._id, {
                                    name: this.name.value,
                                    email: this.email.value,
                                    groups: this.groups.state.value
                                })
                            } else {
                                addschedule({name: this.name.value, email: this.email.value, groups: this.groups.state.value});
                            }
                            hidemodal();
                        }
                    }
                }
            ]
        });
    }
}
Schedules.propTypes = {
    schedules: PropTypes.array.isRequired,
    getschedules: PropTypes.func.isRequired,
    addschedule: PropTypes.func.isRequired,
    removeschedule: PropTypes.func.isRequired,
    updateschedule: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
};

export default Schedules;
