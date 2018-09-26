import * as React from 'react';
import {DropTarget} from 'react-dnd';
import PropTypes from 'prop-types';

const target = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem())
    },
}

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem()
    };
}

class Droppable extends React.Component {

    render() {
        const {connectDropTarget, children, isOver, canDrop, item, className} = this.props;
        return (connectDropTarget && connectDropTarget(
            <div className={className}>
            {children(isOver, canDrop, item)}
        </div>,))
    }
}

Droppable.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    onDrop: PropTypes.func.isRequired,
    canDrop: PropTypes.bool.isRequired,
    item: PropTypes.any,
    children: PropTypes.func.isRequired,
    className: PropTypes.string,
}

export default accepts => DropTarget(accepts, target, collect)(Droppable);