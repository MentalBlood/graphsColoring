'use strict'

class Root extends React.Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		return <GraphMap></GraphMap>;
	}
}

const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(Root), rootElement);