import * as React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import "./Draggable.css";

const source = {
    beginDrag(props) {
        return props.data;
    },
    canDrag(props, monitor) {
        return 'disabled' in props ? !props.disabled : true;
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class Draggable extends React.Component {

    render() {
        const {children, isDragging, connectDragSource} = this.props;
        return (connectDragSource && connectDragSource(
            <div id="draggable">
            {children(isDragging)}
        </div>,))
    }
}

Draggable.propTypes = {
    data: PropTypes.any.isRequired,
    disabled: PropTypes.bool,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
}

export default type => DragSource(type, source, collect)(Draggable);