import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import {Icon} from "semantic-ui-react";
import "react-table/react-table.css";
import MessageForm from "./MessageForm";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import _ from "lodash";

class Messages extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "",
                accessor: "read",
                width: 30,
                Cell: row => <Icon name={row.value ? "circle outline" : "circle"}/>
            }, {
                Header: "From",
                accessor: "",
                Cell: row => <label style={{textDecoration: 'underline', cursor: "pointer"}} onClick={e=>this.sendViewMail("View message", row.value)}>{row.value.from.name}</label>
            }, {
                Header: "Subject",
                accessor: "",
                Cell: row => <label style={{textDecoration: 'underline', cursor: "pointer", width: '100%', overflow: 'hidden'}} onClick={e=>this.sendViewMail("View message", row.value)}>{row.value.subject}</label>
            }, {
                Header: "Message",
                accessor: "",
                Cell: row => <label style={{textDecoration: 'underline', cursor: "pointer", width: '100%', overflow: 'hidden'}} onClick={e=>this.sendViewMail("View message", row.value)}>{row.value.body}</label>
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove group',
                                message: 'Do you really want to delete the message?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.deletemessage(row.value._id);
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
        const {messages, user} = this.props;
        return (
            <div id="messages">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.sendViewMail()}>
                            New
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>Inbox</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={messages.filter(m=>m.to._id.toString()===user._id.toString())}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    sendViewMail = (title = "New message", message = {}) => {
        const {sendmessage, updatemessage, showmodal, hidemodal, users, user} = this.props;
        showmodal({
            title, message: <MessageForm readOnly={Object.keys(message).length > 0} users={users} updateref={e => this.form = e} message={message} submit={data=>{
                if (Object.keys(message).length > 0) {/*edit mode*/
                    updatemessage(message._id, {read: true})
                } else {
                    sendmessage({...data, from: user._id});
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
Messages.propTypes = {
    messages: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    sendmessage: PropTypes.func.isRequired,
    deletemessage: PropTypes.func.isRequired,
    updatemessage: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    isadmin: PropTypes.bool.isRequired,
};

export default Messages;
