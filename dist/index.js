'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _app = require('../app.config');

var _app2 = _interopRequireDefault(_app);

var _Wallet = require('./Wallet');

var _Wallet2 = _interopRequireDefault(_Wallet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wallet = new _Wallet2.default(_extends({}, _app2.default));

wallet.renderApp();