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
				background-color: #4b7bec !important;
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
