import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Form from "../form/Form";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Groups extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "Name",
                accessor: "name"
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="edit"
                            data-tip="Edit this item"
                            onClick={() => this.addEditgroup('Edit group', row.value)}/>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove group',
                                message: 'Do you really want to remove the group?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.removegroup(row.value._id);
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
            .getgroups();
    }

    render() {
        const {groups} = this.props;
        return (
            <div id="groups">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addEditgroup()}>
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of groups</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={groups}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditgroup = (title = "New group", group = {}) => {
        const {addgroup, updategroup, showmodal, hidemodal} = this.props;
        showmodal({
            title, message: <Form ref={e => this.form = e}>
                <div className={"form-group"}>
                    <label htmlFor={"name"}>
                        group name
                    </label>
                    <input
                        id={"name"}
                        className={"form-control"}
                        required={true}
                        name={"name"}
                        type={"text"}
                        defaultValue={group.name}
                        ref={e => this.name = e}/>
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
                            if (Object.keys(group).length > 0) { //edit mode
                                updategroup(group._id, {
                                    name: this.name.value,
                                })
                            } else {
                                addgroup({name: this.name.value});
                            }
                            hidemodal();
                        }
                    }
                }
            ]
        });
    }
}
Groups.propTypes = {
    groups: PropTypes.array.isRequired,
    getgroups: PropTypes.func.isRequired,
    addgroup: PropTypes.func.isRequired,
    removegroup: PropTypes.func.isRequired,
    updategroup: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
};

export default Groups;
