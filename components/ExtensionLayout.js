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
				background-color: #000 !important;
				background: linear-gradient(90deg, #000, #4b7bec, #000);
				max-width: 414px;
				margin: auto;
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
