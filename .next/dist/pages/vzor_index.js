"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _MyLayout = require("../components/MyLayout.js");

var _MyLayout2 = _interopRequireDefault(_MyLayout);

var _link = require("next/dist/lib/link.js");

var _link2 = _interopRequireDefault(_link);

var _isomorphicUnfetch = require("isomorphic-unfetch");

var _isomorphicUnfetch2 = _interopRequireDefault(_isomorphicUnfetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InputPanel = function (_React$Component) {
  (0, _inherits3.default)(InputPanel, _React$Component);

  function InputPanel() {
    (0, _classCallCheck3.default)(this, InputPanel);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InputPanel.__proto__ || (0, _getPrototypeOf2.default)(InputPanel)).call(this));

    _this.handleInputChange = function (event) {
      var value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      _this.setState((0, _defineProperty3.default)({}, event.target.id, value));
    };

    _this.handleSubmit = function (event) {
      alert((0, _stringify2.default)(_this.state));
      event.preventDefault();
    };

    _this.state = { IGNInput: "", modeSelect: "", private: false };

    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(InputPanel, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement("form", { onSubmit: this.handleSubmit }, _react2.default.createElement("input", {
        type: "search",
        onChange: this.handleInputChange,
        value: this.state["IGNInput"],
        id: "IGNInput",
        placeholder: "In-Game Name",
        required: true
      }), (0, _stringify2.default)(this.state), _react2.default.createElement("button", { type: "submit", value: "Search" }, "Search"), _react2.default.createElement("select", { id: "modeSelect", onChange: this.handleInputChange }, _react2.default.createElement("option", { value: "" }, "Any"), _react2.default.createElement("option", { value: "5v5ranked" }, "5v5 Ranked"), _react2.default.createElement("option", { value: "5v5casual" }, "5v5 Casual"), _react2.default.createElement("option", { value: "ranked" }, "3v3 Ranked"), _react2.default.createElement("option", { value: "casual" }, "3v3 Casual"), _react2.default.createElement("option", { value: "br" }, "Battle Royale"), _react2.default.createElement("option", { value: "blitz" }, "Blitz")), _react2.default.createElement("label", null, "Private", _react2.default.createElement("input", {
        type: "checkbox",
        name: "private",
        id: "private",
        onChange: this.handleInputChange
      })));
    }
  }]);

  return InputPanel;
}(_react2.default.Component);

var Player = function Player(_ref) {
  var data = _ref.data;
  return _react2.default.createElement("div", null, "Name: ", data.name, _react2.default.createElement("br", null), "Rank: ", data.rank);
};

var Index = function Index(_ref2) {
  var data = _ref2.data;
  return _react2.default.createElement(_MyLayout2.default, null, _react2.default.createElement(InputPanel, null), _react2.default.createElement(Player, { data: data.player }), _react2.default.createElement("ul", null, data.matches.map(function (match) {
    return _react2.default.createElement("li", { key: match.id }, _react2.default.createElement(_link2.default, { as: "/match/" + match.id, href: "/match?id=" + match.id }, _react2.default.createElement("a", null, match.id)));
  })));
};

Index.getInitialProps = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", {
            data: {
              player: {
                name: "thisBoy",
                rank: "10B"
              },
              matches: [{
                id: "123"
              }, {
                id: "456"
              }]
            }
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

exports.default = Index;