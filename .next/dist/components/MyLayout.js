"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _style = require("styled-jsx/style.js");

var _style2 = _interopRequireDefault(_style);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var layoutStyle = {
	margin: 20,
	padding: 20,
	border: "1px solid #DDD"
};

var Layout = function Layout(props) {
	return _react2.default.createElement("div", { style: layoutStyle, className: "jsx-756146860"
	}, props.children, _react2.default.createElement(_style2.default, {
		styleId: "756146860",
		css: ["body{background-color:#999;}"]
	}));
};

exports.default = Layout;