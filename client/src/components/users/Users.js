import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import style from "./Users.css";

const columns = [
    {
        Header: "Name",
        accessor: "name"
    },
    {
        Header: "",
        accessor: "",
        width: 70,
        Cell: props => (
            <button type="button" className={style.remove}>
                -
            </button>
        )
    }
];

class Users extends Component {
    componentDidMount() {
        this.props.getusers();
    }

    render() {
        const { users, adduser } = this.props;
        return (
            <div>
                <div className="row" style={{ alignItems: "center" }}>
                    <div className="col-1">
                        <button type="button" className="btn btn-success">
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of users</h1>
                    </div>
                    <div className="col-1" />
                </div>
                <ReactTable
                    data={users}
                    columns={columns}
                    showPagination={false}
                    style={{
                        height: "400px"
                    }}
                    className="-striped -highlight"
                />
                <input
                    ref={e => {
                        this.input = e;
                    }}
                    type="text"
                    placeholder="User name"
                />
                <button
                    type="button"
                    onClick={() => {
                        adduser({ name: this.input.value });
                        this.input.value = "";
                    }}
                >
                    Add
                </button>
            </div>
        );
    }
}
Users.propTypes = {
    users: PropTypes.array.isRequired,
    getusers: PropTypes.func.isRequired,
    adduser: PropTypes.func.isRequired
};

export default Users;
