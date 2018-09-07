import Document, { Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-125429066-1"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'UA-125429066-1');
              `
            }}
          />
          <link rel="stylesheet" href="/_next/static/style.css" />
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
          />
          <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
          <link rel="icon" type="image/png" href="/static/img/draft/logo.png" />
        </Head>
        <body style={{ margin: 0 }}>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
