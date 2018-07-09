import React from 'react';

class App extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }
  state = {};
  render() {
    return (
      <div>
        <div id="wrapper" style={this.props.overrideStyle}>
          {this.props.children}
          <style jsx global>
            {`
              body {
                background-color: hsla(195, 46%, 10%, 1);
                color: white;
              }
            `}
          </style>
          <style jsx>
            {`
              #wrapper {
                position: relative;
                width: 480px;
                max-width: 100vw;
                min-width: 320px;
                overflow: hidden;
                margin: 5% auto;
                padding: 30px;
                box-sizing: border-box;
                border-radius: 35px;
                box-shadow: 0px 5px 40px 0px hsla(0, 0%, 90%, 0.2);
                background-color: hsla(201, 33%, 15%, 1);
                transition: 0.5s linear;
              }
              @media (max-width: 500px) {
                #wrapper {
                  border-radius: 0;
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
