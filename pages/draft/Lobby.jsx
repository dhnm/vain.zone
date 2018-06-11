import React from 'react';

class App extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }
  state = {};
  render() {
    return (
      <div>
        <div id="wrapper">
          {this.props.children}
          <style jsx>
            {`
              #wrapper {
                position: relative;
                width: 480px;
                max-width: 100vw;
                min-width: 320px;
                overflow: hidden;
                margin: 6% auto;
                padding: 30px;
                box-sizing: border-box;
                border-radius: 40px;
                box-shadow: 0 0 20px hsla(0, 0%, 90%, 1);
                background-color: white;
              }
              @media (max-width: 632px) {
                #wrapper {
                  margin: 0 auto;
                  box-shadow: none;
                  padding: 15px;
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }
}

export default App;
