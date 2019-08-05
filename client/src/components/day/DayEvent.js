import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import "./DayEvent.css";

class DayEvent extends PureComponent {
    render() {
        const {
            event,
            removeevent,
            user,
            isadmin,
            showmodal,
            hidemodal,
        } = this.props;
        return (
            <div className="dayevent">
                <span
                    onClick={() => {
                    if (!isadmin && (!event.user || event.user._id !== user._id)) {/*Removing someone elses event is not allowed*/
                        return;
                    }
                    showmodal({
                        title: "Delete?",
                        message: "Are you sure you want to delete this event?",
                        size: 'mini',
                        buttons: [
                            {
                                label: 'Cancel',
                                className: 'negative',
                                callback: hidemodal
                            }, 
                            {
                                label: 'OK',
                                className: 'positive',
                                callback: () => {
                                    removeevent(event._id);
                                    hidemodal();
                                }
                            }
                        ],
                    });
                    
                }}
                    style={{
                    backgroundColor: 'cornflowerblue',
                    cursor: event.user && (isadmin || event.user._id === user._id) ? 'pointer' : 'default'
                }}>
                <label style={{padding: 3}}>{`${event.type} ${event.user ? '('+event.user.name+')' : ''}`}</label>
                {isadmin || (event.user && event.user._id === user._id)/*Only show delete icon if it's your own event*/
                        ? <FontAwesomeIcon icon="trash-alt" className="delete"/>
                        : null
                } 
                </span>
            </div>
        )
    }
}

DayEvent.propTypes = {
    event: PropTypes.object.isRequired,
    removeevent: PropTypes.func.isRequired,
    showmodal: PropTypes.func.isRequired,
    hidemodal: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
}

export default DayEvent;