import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Dropdown} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import UserForm from "./UserForm";
import _ from "lodash";

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
                    <Dropdown icon='ellipsis vertical' simple item direction="left">
                        <Dropdown.Menu>
                            <Dropdown.Item
                                data-tip="User Profile"
                                onClick={() => props.history.push({
                                pathname: "/profile",
                                state: {
                                    user: row.value,
                                    groups: props.groups
                                }
                            })}>Profile</Dropdown.Item>
                            <Dropdown.Item
                                data-tip="Edit this item"
                                onClick={() => this.addEditUser('Edit User', row.value)}>Edit</Dropdown.Item>
                            <Dropdown.Item
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
                            }}>Remove</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
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
            title,
            message: () => <UserForm
                updateref={e => this.form = e}
                user={user}
                groups={groups}
                submit={data => {
                if (Object.keys(user).length > 0) {/*edit mode*/
                    const update = {
                        ...user,
                        ...data
                    };
                    if (!_.isEqual(update, user)) {
                        updateuser(user._id, {
                            name: data.name.value,
                            email: data.email.value,
                            groups: data.groups.state.value
                        })
                    }
                } else {
                    adduser({name: data.name.value, email: data.email.value, groups: data.groups.state.value});
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
    getusers: PropTypes.func.isRequired,
    adduser: PropTypes.func.isRequired,
    removeuser: PropTypes.func.isRequired,
    updateuser: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    groups: PropTypes.array.isRequired,
    getgroups: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
};

export default Users;
