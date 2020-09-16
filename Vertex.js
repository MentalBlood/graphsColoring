'use strict';

const circleRadius = 4;

function Vertex(props) {
  const {
    x,
    y,
    color,
    id,
    onClick
  } = props;
  const colorClass = color ? 'enabled' : '';
  return /*#__PURE__*/React.createElement("circle", {
    className: 'vertex ' + colorClass,
    cx: x,
    cy: y,
    r: circleRadius + 'vmin',
    onClick: e => onClick(id),
    onWheel: e => console.log(id)
  });
}