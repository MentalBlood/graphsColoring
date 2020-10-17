'use strict'

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
		connectedVertexesKeys: [],
		internalMap: undefined
	};
}

function shuffleArray(array) {
	for(let i = 0; i < array.length; i++){
		const j = Math.floor(Math.random() * (array.length-i-1))
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
}

const cellsInLine = Math.ceil((100 - circleRadius * 3) / (circleRadius * 3));

function generateRandomVertexes(number) {
	const vertexes = [];
	number = Math.min(cellsInLine * cellsInLine, number);

	const possibleCoordinates = [];
	for (let x = 0; x < cellsInLine; x++)
		for (let y = 0; y < cellsInLine; y++)
			possibleCoordinates.push({x: x, y: y});
	shuffleArray(possibleCoordinates);
	possibleCoordinates.slice(0, number).forEach(c => vertexes.push(createVertex(c.x, c.y)));
	return vertexes;
}

function edgesIntersect2(e1, e2, vertexes) {
	const p0_x = vertexes[e1.fromKey].x; const p0_y = vertexes[e1.fromKey].y;
	const p1_x = vertexes[e1.toKey].x; const p1_y = vertexes[e1.toKey].y;
	const p2_x = vertexes[e2.fromKey].x; const p2_y = vertexes[e2.fromKey].y;
	const p3_x = vertexes[e2.toKey].x; const p3_y = vertexes[e2.toKey].y;

    const s1_x = p1_x - p0_x;     const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;     const s2_y = p3_y - p2_y;

    const divider = -s2_x * s1_y + s1_x * s2_y;

    const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / divider;
    const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / divider;

    const result = s >= 0 && s <= 1 && t >= 0 && t <= 1;
    return result;
}

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(point, segmentPointA, segmentPointB) {
  var l2 = dist2(segmentPointA, segmentPointB);
  if (l2 == 0) return dist2(point, segmentPointA);
  var t =	((point.x - segmentPointA.x) * (segmentPointB.x - segmentPointA.x) +
  			(point.y - segmentPointA.y) * (segmentPointB.y - segmentPointA.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(point, { x: segmentPointA.x + t * (segmentPointB.x - segmentPointA.x),
                    y: segmentPointA.y + t * (segmentPointB.y - segmentPointA.y) });
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
		const vertexesKeysToCheck =
			alreadyConnectedVertexesKeys.concat(vertexesKeys.filter(v =>
				alreadyConnectedVertexesKeys[v] === undefined
			));
		let found = false;
		for (const anotherVertexKey of vertexesKeysToCheck) {
			edge.toKey = anotherVertexKey;
			const anotherVertex = vertexes[anotherVertexKey];
			const edgesToCheck = edges.filter(e =>
				(e.fromKey !== anotherVertexKey) &&
				(e.toKey !== anotherVertexKey)
			);
			if (
				(anotherVertexKey !== vertexKey) &&
				!vertexes[vertexKey].connectedVertexesKeys.includes(anotherVertexKey) &&
				edgesToCheck.every(anotherEdge =>
					!edgesIntersect2(edge, anotherEdge, vertexes)) &&
				vertexesKeysToCheck
					.filter(v => v !== vertexKey && v !== anotherVertexKey)
					.every(key => {
						const edgeFrom = vertexes[edge.fromKey];
						const edgeTo = vertexes[edge.toKey];
						const v = vertexes[key];
						return !edgeIntersectCircle(edgeFrom, edgeTo, v, circleRadius);
					})
			) {
				found = true;
				break;
			}
		}
		if (found == false)
			continue;
		
		vertexes[edge.fromKey].connectedVertexesKeys.push(edge.toKey);
		vertexes[edge.toKey].connectedVertexesKeys.push(edge.fromKey);
		
		alreadyConnectedVertexesKeysDict[edge.fromKey] = true;
		alreadyConnectedVertexesKeysDict[edge.toKey] = true;

		edges.push(edge);
	};
	return edges;
}

function randomString() {
	return new Date().valueOf().toString(36) + Math.random().toString(36).substr(2);
}

function allVertexesSameColor(vertexes) {
	const baseColor = vertexes[0].color;
	for (const vertex of vertexes)
		if (vertex.color !== baseColor)
			return false;
	return true;
}

class GraphMap extends React.Component {
	constructor(props) {
		super(props);

		if (props.seed)
			Math.seedrandom(props.seed);

		this.state = this.generateNewMap();
		this.state['renderInternal'] = false;
		this.state['internalId'] = undefined;
		this.state['zoomOutFunction'] =
			props.zoomOutFunction ? props.zoomOutFunction : () => undefined;
		this.state.win = allVertexesSameColor(Object.values(this.state.vertexes));

		this.changeVertexColor = this.changeVertexColor.bind(this);
		this.handleWheel = this.handleWheel.bind(this);
		this.zoomOutOfInternalMap = this.zoomOutOfInternalMap.bind(this);
		this.keyHandler = this.keyHandler.bind(this);
	}

	generateNewMap() {
		const vertexesList = generateRandomVertexes(Math.floor(cellsInLine * cellsInLine / 2.5));
		const vertexesDict = Object.assign({}, ...vertexesList.map(vertex => {
			const x = vertex.x;
			const y = vertex.y;
			const vertexId = x.toString() + ' ' + y.toString();
			return {[vertexId]: vertex};
		}));
		return {
			vertexes: vertexesDict,
			edges: createRandomEdges(vertexesDict)
		};
	}

	changeVertexColor(key) {
		this.setState(state => {
			state.vertexes[key].color = !state.vertexes[key].color;
			state.vertexes[key].connectedVertexesKeys.forEach(connectedKey => {
				const vertex = state.vertexes[connectedKey];
				vertex.color = !vertex.color;
			});
			state.win = allVertexesSameColor(Object.values(state.vertexes));
			return state;
		});
	}

	zoomOutOfInternalMap(internalWinColor) {
		console.log('internalWinColor:', internalWinColor);
		this.setState(state => {
			if (internalWinColor !== undefined)
				state.vertexes[state.internalId].color = internalWinColor === '1';
			state.renderInternal = false;
			state.internalId = undefined;
			return state;
		});
	}

	handleWheel(e, id) {
		if (e.deltaY < 0) {
			const zoomOutFunction = this.zoomOutOfInternalMap;
			this.setState(state => {
				const vertex = state.vertexes[id];
				if (vertex.internalMap === undefined) {
					vertex.internalMap = {
						'seed': randomString()
					};
					vertex.internalMap.component = <GraphMap zoomOutFunction={zoomOutFunction}
													seed={vertex.internalMap.seed}></GraphMap>
					}
				else
					vertex.internalMap.component = <GraphMap zoomOutFunction={zoomOutFunction}
													seed={vertex.internalMap.seed}></GraphMap>
				state.internalId = id;
				state.renderInternal = true;
				return state;
			});
		}
	}

	setVertexesColor(color) {
		this.setState(state => {
			for (const key of Object.keys(state.vertexes))
				state.vertexes[key].color = color;
			state.win = true;
			return state;
		});
	}

	keyHandler(event) {
		const key = event.key;
		const actions = {
			'd': () => this.setVertexesColor(true),
			'f': () => this.setVertexesColor(false)
		};
		if (actions.hasOwnProperty(key))
			actions[key]();
	}

	render() {
		const vertexes = this.state.vertexes;

		if (this.state.renderInternal)
			return vertexes[this.state.internalId].internalMap.component;

		const edges = this.state.edges;
		const win = this.state.win;
		const winColor = win ? (Object.values(this.state.vertexes)[0].color ? '1' : '2') : undefined;

		return (
			<div 	onKeyPress={this.keyHandler}
					onWheel={e => (e.deltaY > 0) ? this.state.zoomOutFunction(winColor) : undefined}
					tabIndex='0'>
				<svg className={"graphMap " + (win ? 'win' + ' winColor-' + winColor : '')} xmlns="http://www.w3.org/2000/svg" width="100vw" height="100vh">
					{
						this.state.edges.map((edge, index) => {
							const from = vertexes[edge.fromKey];
							const to = vertexes[edge.toKey];
							return <line className="edge" x1={from.x + 'vw'} y1={from.y + 'vh'}
									x2={to.x + 'vw'} y2={to.y + 'vh'} key={index}/>;
						})
					}
					{
						Object.entries(vertexes).map(([key, vertex]) => {
							return <Vertex x={vertex.x + 'vw'} y={vertex.y + 'vh'}
									color={vertex.color} id={key}
									onClick={this.changeVertexColor}
									onWheel={this.handleWheel} key={key}></Vertex>;
						})
					}
				</svg>
			</div>
		);
	}
}