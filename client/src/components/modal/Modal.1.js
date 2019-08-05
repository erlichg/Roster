import React from "react";
import PropTypes from "prop-types";
import {Button, Header, Modal as M} from 'semantic-ui-react';

class Modal extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.modaloptions && nextProps.modaloptions.state) {
            this.setState(nextProps.modaloptions.state);
        }
    }
    render() {
        const {modal, hidemodal, modaloptions} = this.props;
        return (
            <M
                style={{
                position: 'initial',
                overflow: 'initial'
            }}
                open={modal}
                onClose={hidemodal}
                closeOnDimmerClick={false}
                size={modaloptions.size || 'small'}>
                <Header>{modaloptions.title}</Header>
                <M.Content
                    children={typeof(modaloptions.message) === 'function'
                    ? modaloptions
                        .message
                        .bind(this)()
                    : modaloptions.message || null}/>
                <M.Actions>
                    {(modaloptions.buttons || []).map((b, i) => {
                        const {
                            label = '',
                            className = 'btn-primary',
                            callback = () => {},
                            type = 'button'
                        } = b;
                        return <Button
                            key={i}
                            type={type}
                            className={'btn ' + className}
                            onClick={callback.bind(this)} content={label}/>
                    })}
                </M.Actions>
            </M>
        );
    }
}

Modal.propTypes = {
    modal: PropTypes.bool.isRequired,
    hidemodal: PropTypes.func.isRequired,
    modaloptions: PropTypes.object.isRequired
};

export default Modal;
