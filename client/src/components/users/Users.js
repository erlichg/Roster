import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Dropdown} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import Form from "../form/Form";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Users extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "Name",
                accessor: "name"
            }, {
                Header: "Email",
                accessor: "email"
            }, {
                id: "groups",
                Header: "Groups",
                accessor: d => d
                    .groups
                    .map(g => g.name)
                    .join(", ")
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="edit"
                            data-tip="Edit this item"
                            onClick={() => this.addEditUser('Edit User', row.value)}/>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove user',
                                message: 'Do you really want to remove the user?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.removeuser(row.value._id);
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
            .getusers();
        this
            .props
            .getgroups();
    }

    render() {
        const {users} = this.props;
        return (
            <div id="Users">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addEditUser()}>
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of users</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={users}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditUser = (title = "New User", user = {}) => {
        const {groups, adduser, updateuser, showmodal, hidemodal} = this.props;
        showmodal({
            title, message: <Form ref={e => this.form = e}>
                <div className={"form-group"}>
                    <label htmlFor={"name"}>
                        User name
                    </label>
                    <input
                        id={"name"}
                        className={"form-control"}
                        required={true}
                        name={"name"}
                        type={"text"}
                        defaultValue={user.name}
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
                        defaultValue={user.email}
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
                        defaultValue={user.groups
                        ? user
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
                            if (Object.keys(user).length > 0) { //edit mode
                                updateuser(user._id, {
                                    name: this.name.value,
                                    email: this.email.value,
                                    groups: this.groups.state.value
                                })
                            } else {
                                adduser({name: this.name.value, email: this.email.value, groups: this.groups.state.value});
                            }
                            hidemodal();
                        }
                    }
                }
            ]
        });
    }
}
Users.propTypes = {
    users: PropTypes.array.isRequired,
    getusers: PropTypes.func.isRequired,
    adduser: PropTypes.func.isRequired,
    removeuser: PropTypes.func.isRequired,
    updateuser: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
    getgroups: PropTypes.func.isRequired
};

export default Users;
