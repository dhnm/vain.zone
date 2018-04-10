import Head from "next/head";

const ExtensionLayout = props => (
	<div id="container">
		<Head>
			<title>VAIN.ZONE</title>
			<meta
				name="viewport"
				content="initial-scale=1.0, width=device-width"
			/>
			<link
				rel="stylesheet"
				href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
			/>
		</Head>
		{props.children}
		<style jsx global>{`
			body {
				background-color: black !important;
				max-width: 414px;
				margin: auto;

				background-image: linear-gradient(
						hsla(0, 0%, 0%, 0.4),
						hsla(0, 0%, 0%, 0.4),
						hsla(0, 0%, 0%, 0.4),
						hsla(227, 32%, 9%, 0.5),
						hsla(227, 32%, 9%, 1)
					),
					url("/static/img/bg.jpg");
				background-repeat: no-repeat;
				background-position: center center;
				background-attachment: fixed;
				background-size: cover;
			}
		`}</style>
		<style jsx>{`
			#container {
				min-height: 100vh;
			}
		`}</style>
	</div>
);

export default ExtensionLayout;
