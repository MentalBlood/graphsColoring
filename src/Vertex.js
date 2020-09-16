'use strict'

const circleRadius = 8;

function Vertex(x, y, color, key, onClick) {
	const colorClass = color ? 'enabled' : '';
	return <circle className={'vertex ' + colorClass} cx={x} cy={y} key={key}
			r={circleRadius + 'vmin'} onClick={e => onClick(key)}></circle>;
}