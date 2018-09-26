import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Dropdown} from "semantic-ui-react";
import UserForm from "./UserForm";
import _ from "lodash";

class Users extends Component {

    render() {
        const {history, groups, roles, showmodal, hidemodal, removeuser} = this.props;
        const columns = [
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
                id: "role",
                Header: "Role",
                accessor: d=>d.role?d.role.name:''
            }, {
                Header: "Location",
                accessor: "location"
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <Dropdown icon='ellipsis vertical' simple item direction="left">
                        <Dropdown.Menu>
                            <Dropdown.Item
                                onClick={() => history.push({
                                pathname: "/profile",
                                state: {
                                    user: row.value
                                }
                            })}>Profile</Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => this.addEditUser('Edit User', row.value)}>Edit</Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                showmodal({
                                    title: 'Remove user',
                                    message: 'Do you really want to remove the user?',
                                    buttons: [
                                        {
                                            label: 'No',
                                            callback: hidemodal
                                        }, {
                                            label: 'Yes',
                                            callback: () => {
                                                removeuser(row.value._id);
                                                hidemodal();
                                            }
                                        }
                                    ]
                                })
                            }}>Remove</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )
            }
        ];
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
                    columns={columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditUser = (title = "New User", user = {}) => {
        const {groups, roles, adduser, updateuser, showmodal, hidemodal} = this.props;
        showmodal({
            title,
            message: () => <UserForm
                updateref={e => this.form = e}
                user={user}
                groups={groups}
                roles={roles}
                submit={data => {
                if (Object.keys(user).length > 0) {/*edit mode*/
                    const update = {
                        ...user,
                        ...data
                    };
                    if (!_.isEqual(update, user)) {
                        updateuser(user._id, data)
                    }
                } else {
                    adduser(data);
                }
                hidemodal();
            }}/>,
            buttons: [
                {
                    label: 'Cancel',
                    className: 'btn-danger',
                    callback: hidemodal
                }, {
                    label: 'OK',
                    className: 'btn-success',
                    callback: () => {
                        this
                            .form
                            .submitHandler();
                    }
                }
            ]
        });
    }
}
Users.propTypes = {
    users: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    adduser: PropTypes.func.isRequired,
    removeuser: PropTypes.func.isRequired,
    updateuser: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    isadmin: PropTypes.bool.isRequired,
};

export default Users;
