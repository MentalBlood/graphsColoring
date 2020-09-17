'use strict';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return /*#__PURE__*/React.createElement(GraphMap, null);
  }

}

const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(Root), rootElement);