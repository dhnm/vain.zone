import Header from "./Header";

const layoutStyle = {
	margin: 20,
	padding: 20,
	border: "1px solid #DDD"
};

const Layout = props => (
	<div style={layoutStyle}>
		<Header />
		{props.children}
		<style jsx global>{`
			body {
				background-color: #999;
			}
		`}</style>
	</div>
);

export default Layout;
