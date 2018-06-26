import Document, { Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <link rel="stylesheet" href="/_next/static/style.css" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
          />
          <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
          <script src="https://jsconsole.com/js/remote.js?df50e402-65bc-4b37-ada7-aea610c438e3" />
        </Head>
        <body style={{ margin: 0 }}>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
