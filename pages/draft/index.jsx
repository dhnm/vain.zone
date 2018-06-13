import React from 'react';
import axios from 'axios';
import Head from 'next/head';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Host from './Host';
import Guest from './Guest';

const App = (props) => (
  <React.Fragment>
    <Head>
      <link
        href="https://fonts.googleapis.com/css?family=Montserrat:400,700|Open+Sans:400,700"
        rel="stylesheet"
      />
    </Head>
    <ToastContainer toastClassName="custom-toast" />
    {props.roomID ? <Guest {...props} /> : <Host {...props} />}
    <style jsx global>
      {`
        body {
          font-family: 'Open Sans', sans-serif;
        }
        header,
        h1,
        h2,
        h3 {
          text-align: center;
          font-family: 'Montserrat', sans-serif;
        }
        .custom-toast {
          text-align: center;
          box-shadow: 0 0 20px hsla(0, 0%, 90%, 1);
          border-top: 8px solid hsla(0, 0%, 0%, 0.2);
          border-bottom: 8px solid hsla(0, 0%, 0%, 0.2);
        }
      `}
    </style>
  </React.Fragment>
);

App.getInitialProps = async ({ query }) => {
  try {
    const res = await axios(`${query.urlPath}/api/uuidv4?n=2`);
    const data = await res.data;

    return {
      ...query,
      blueID: data[0],
      redID: data[1],
    };
  } catch (err) {
    return {
      ...query,
      blueID:
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15),
      redID:
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15),
    };
  }
};

export default App;
