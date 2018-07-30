import React from "react";
import PropTypes from "prop-types";
import M from 'react-modal';
M.setAppElement('body')

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
                isOpen={modal}
                onRequestClose={hidemodal}
                style={{
                content: {
                    border: '1px solid black',
                    borderRadius: '4px',
                    bottom: 'auto',
                    height: '350px',
                    width: '840px',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    marginTop: '-150px',
                    marginLeft: '-420px',
                    padding: '2rem',
                    backgroundColor: 'white',
                    boxShadow: '0 0 60px 10px rgba(0, 0, 0, 0.9)',
                    textAlign: 'center',
                    overflow: 'hide'
                }
            }}>
                <h1 style={{
                    height: '30px'
                }}>{modaloptions.title}</h1>
                <div style={{height: 'calc(350px - 4rem - 30px - 45px)', overflow: 'auto', display: 'table-cell', width: 'calc(840px - 4rem)', verticalAlign: 'middle'}}>
                    {typeof(modaloptions.message) === 'function'
                        ? modaloptions
                            .message
                            .bind(this)()
                        : modaloptions.message || null}
                </div>
                <div style={{
                    paddingTop: '10px', height: '45px'
                }}>
                    {(modaloptions.buttons || []).map((b, i) => {
                        const {
                            label = '',
                            className = 'btn-primary',
                            callback = () => {}
                        } = b;
                        return <button
                            key={i}
                            style={{
                            marginRight: '5px'
                        }}
                            type="button"
                            className={'btn ' + className}
                            onClick={callback.bind(this)}>{label}</button>
                    })}
                </div>
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
