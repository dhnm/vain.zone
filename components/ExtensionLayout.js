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
					url("https://x.vainglory.eu/vg_extension2/assets/img/bg.jpg");
				background-repeat: no-repeat;
				background-position: top center;
				background-attachment: fixed;
				background-size: 165vw calc(165vw * (9/16));
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
