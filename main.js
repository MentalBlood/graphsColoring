'use strict';

function randomInteger(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function randomElement(array) {
  return array[randomInteger(0, array.length - 1)];
}

function createVertex(x, y) {
  return {
    x: x * circleRadius * 3 + circleRadius * 1.5,
    y: y * circleRadius * 3 + circleRadius * 1.5,
    color: Math.random() >= 0.5,
    connectedVertexesKeys: []
  };
}

function shuffleArray(array, limit) {
  limit = limit === undefined ? array.length : Math.min(array.length, limit);

  for (let i = 0; i < limit; i++) {
    const j = Math.floor(Math.random() * (array.length - i));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function generateRandomVertexes(number) {
  const vertexes = [];
  const cellsInLine = Math.ceil((100 - circleRadius * 3) / (circleRadius * 3));
  number = Math.min(cellsInLine * cellsInLine, number);
  const possibleCoordinates = [];

  for (let x = 0; x < cellsInLine; x++) for (let y = 0; y < cellsInLine; y++) possibleCoordinates.push({
    x: x,
    y: y
  });

  shuffleArray(possibleCoordinates);
  possibleCoordinates.slice(0, number).forEach(c => vertexes.push(createVertex(c.x, c.y)));
  return vertexes;
}

function edgesIntersect2(e1, e2, vertexes) {
  const p0_x = vertexes[e1.fromKey].x;
  const p0_y = vertexes[e1.fromKey].y;
  const p1_x = vertexes[e1.toKey].x;
  const p1_y = vertexes[e1.toKey].y;
  const p2_x = vertexes[e2.fromKey].x;
  const p2_y = vertexes[e2.fromKey].y;
  const p3_x = vertexes[e2.toKey].x;
  const p3_y = vertexes[e2.toKey].y;
  const s1_x = p1_x - p0_x;
  const s1_y = p1_y - p0_y;
  const s2_x = p3_x - p2_x;
  const s2_y = p3_y - p2_y;
  const divider = -s2_x * s1_y + s1_x * s2_y;
  const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / divider;
  const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / divider;
  const result = s >= 0 && s <= 1 && t >= 0 && t <= 1;
  return result;
}

function sqr(x) {
  return x * x;
}

function dist2(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y);
}

function distToSegmentSquared(point, segmentPointA, segmentPointB) {
  var l2 = dist2(segmentPointA, segmentPointB);
  if (l2 == 0) return dist2(point, segmentPointA);
  var t = ((point.x - segmentPointA.x) * (segmentPointB.x - segmentPointA.x) + (point.y - segmentPointA.y) * (segmentPointB.y - segmentPointA.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(point, {
    x: segmentPointA.x + t * (segmentPointB.x - segmentPointA.x),
    y: segmentPointA.y + t * (segmentPointB.y - segmentPointA.y)
  });
}

function edgeIntersectCircle(edgeFrom, edgeTo, circleCenter, circleRadius) {
  return distToSegmentSquared(circleCenter, edgeFrom, edgeTo) <= sqr(circleRadius);
}

function createRandomEdges(vertexes) {
  const edges = [];
  const vertexesKeys = Object.keys(vertexes);
  const alreadyConnectedVertexesKeysDict = {};

  for (const vertexKey of vertexesKeys.slice()) {
    const edge = {
      fromKey: vertexKey,
      toKey: undefined
    };
    const alreadyConnectedVertexesKeys = Object.keys(alreadyConnectedVertexesKeysDict);
    shuffleArray(alreadyConnectedVertexesKeys);
    shuffleArray(vertexesKeys);
    const vertexesKeysToCheck = alreadyConnectedVertexesKeys.concat(vertexesKeys.filter(v => alreadyConnectedVertexesKeys[v] === undefined));
    let found = false;

    for (const anotherVertexKey of vertexesKeysToCheck) {
      edge.toKey = anotherVertexKey;
      const anotherVertex = vertexes[anotherVertexKey];
      const edgesToCheck = edges.filter(e => e.fromKey !== anotherVertexKey && e.toKey !== anotherVertexKey);

      if (anotherVertexKey !== vertexKey && !(anotherVertexKey in vertexes[vertexKey].connectedVertexesKeys) && edgesToCheck.every(anotherEdge => !edgesIntersect2(edge, anotherEdge, vertexes)) && vertexesKeysToCheck.filter(v => v !== vertexKey && v !== anotherVertexKey).every(key => {
        const edgeFrom = vertexes[edge.fromKey];
        const edgeTo = vertexes[edge.toKey];
        const v = vertexes[key];
        return !edgeIntersectCircle(edgeFrom, edgeTo, v, circleRadius);
      })) {
        found = true;
        break;
      }
    }

    if (found == false) continue;
    const finalAnotherVertexKey = edge.toKey;
    vertexes[vertexKey].connectedVertexesKeys.push(finalAnotherVertexKey);
    vertexes[finalAnotherVertexKey].connectedVertexesKeys.push(vertexKey);
    alreadyConnectedVertexesKeysDict[vertexKey] = true;
    alreadyConnectedVertexesKeysDict[finalAnotherVertexKey] = true;
    edges.push(edge);
  }

  ;
  return edges;
}

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.generateNewMap();
    this.changeVertexColor = this.changeVertexColor.bind(this);
  }

  generateNewMap() {
    const vertexesList = generateRandomVertexes(10);
    const vertexesDict = Object.assign({}, ...vertexesList.map(vertex => {
      const x = vertex.x;
      const y = vertex.y;
      const vertexId = x * y * (x > y ? 1 : -1);
      return {
        [vertexId]: vertex
      };
    }));
    return {
      vertexes: vertexesDict,
      edges: createRandomEdges(vertexesDict)
    };
  }

  changeVertexColor(key) {
    this.setState(state => {
      console.log('main', key);
      state.vertexes[key].color = !state.vertexes[key].color;
      state.vertexes[key].connectedVertexesKeys.forEach(connectedKey => {
        console.log('connected', connectedKey);
        const vertex = state.vertexes[connectedKey];
        vertex.color = !vertex.color;
      });
      return state;
    });
  }

  render() {
    const vertexes = this.state.vertexes;
    const edges = this.state.edges;
    return /*#__PURE__*/React.createElement("div", {
      className: "root"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "map",
      xmlns: "http://www.w3.org/2000/svg",
      width: "100vw",
      height: "100vh"
    }, this.state.edges.map((edge, index) => {
      const from = vertexes[edge.fromKey];
      const to = vertexes[edge.toKey];
      return /*#__PURE__*/React.createElement("line", {
        className: "edge",
        x1: from.x + 'vw',
        y1: from.y + 'vh',
        x2: to.x + 'vw',
        y2: to.y + 'vh',
        key: index
      });
    }), Object.entries(vertexes).map(([key, vertex]) => {
      return Vertex(vertex.x + 'vw', vertex.y + 'vh', vertex.color, key, this.changeVertexColor);
    })));
  }

}

const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(Root), rootElement);