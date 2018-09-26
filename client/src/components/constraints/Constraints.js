import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import {Checkbox} from 'semantic-ui-react';
import ConstraintForm from './ConstraintForm';


class Constraints extends React.Component {
    
    constructor(props) {
        super(props);
        this.columns = [
            {
                Header: "Name",
                accessor: "name"
            }, {
                Header: "Type",
                accessor: "type",
                Cell: row => row.value ? <label data-tip={this.props.constrainttypes[row.value].description}>{this.props.constrainttypes[row.value].label}</label> : null
                
            }, {
                id: "groups",
                Header: "Groups",
                accessor: d => d.groups.map(g=>g.name).join(", ")
            }, {
                Header: "Enabled",
                accessor: "",
                Cell: row => {
                    const {_id, enabled} = row.value;
                    return <Checkbox
                        toggle
                        defaultChecked={enabled}
                        onChange={e => {
                        props.updateconstraint(_id, {
                            enabled: !enabled
                        });
                    }}/>;
                }
            }, {
                Header: "Severity",
                accessor: "severity",
            }, {
                Header: "",
                accessor: "",
                width: 70,
                Cell: row => (
                    <div className="buttons">
                        <FontAwesomeIcon
                            icon="edit"
                            data-tip="Edit this item"
                            onClick={() => this.addEditConstraint('Edit constraint', row.value)}/>
                        <FontAwesomeIcon
                            icon="trash-alt"
                            data-tip="Remove this item"
                            onClick={() => {
                            props.showmodal({
                                title: 'Remove constraint',
                                message: 'Do you really want to remove the constraint?',
                                buttons: [
                                    {
                                        label: 'No',
                                        callback: props.hidemodal
                                    }, {
                                        label: 'Yes',
                                        callback: () => {
                                            props.removeconstraint(row.value._id);
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
        const {constraints} = this.props;
        return (
            <div id="constraints">
                <div
                    className="row"
                    style={{
                    alignItems: "center"
                }}>
                    <div className="col-1">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addEditConstraint()}>
                            Add
                        </button>
                    </div>
                    <div className="col-10">
                        <h1>List of constraints</h1>
                    </div>
                    <div className="col-1"/>
                </div>
                <ReactTable
                    data={constraints}
                    columns={this.columns}
                    showPagination={false}
                    style={{
                    height: "400px"
                }}
                    className="-striped -highlight"/>
            </div>
        );
    }

    addEditConstraint = (title = "New Constraint", constraint = {}) => {
        const {addconstraint, updateconstraint, showmodal, hidemodal, groups, constrainttypes} = this.props;

        showmodal({
            title,
            message: <ConstraintForm
                updateref={e => this.form = e}
                constraint={constraint}
                groups={groups}
                constrainttypes={constrainttypes}
                submit={data => {
                if (Object.keys(constraint).length > 0) {/*edit mode*/
                    const update = {
                        ...constraint,
                        ...data
                    };
                    if (!_.isEqual(update, constraint)) {
                        updateconstraint(constraint._id, data)
                    }
                } else {
                    addconstraint(data);
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

Constraints.propTypes = {
    constraints: PropTypes.array.isRequired,
    constrainttypes: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired,
    addconstraint: PropTypes.func.isRequired,
    removeconstraint: PropTypes.func.isRequired,
    updateconstraint: PropTypes.func.isRequired
};

export default Constraints;
