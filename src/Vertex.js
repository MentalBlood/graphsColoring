'use strict'

const circleRadius = 4;

function Vertex(props) {
	const {x, y, color, id, onClick, onWheel} = props;
	const colorClass = color ? 'enabled' : '';
	return <circle className={'vertex ' + colorClass} cx={x} cy={y}
			r={circleRadius + 'vmin'} onClick={e => onClick(id)}
			onWheel={e => onWheel(e, id)}></circle>;
}