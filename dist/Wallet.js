'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reactRouterDom = require('react-router-dom');

var _redux = require('redux');

var _reactRouterRedux = require('react-router-redux');

var _createBrowserHistory = require('history/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _lightwalletMin = require('eth-lightwallet/dist/lightwallet.min.js');

var _ethereumjsTx = require('ethereumjs-tx');

var _ethereumjsTx2 = _interopRequireDefault(_ethereumjsTx);

var _ethereumjsUtil = require('ethereumjs-util');

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _index = require('gittoken-reducers/dist/index');

var _index2 = _interopRequireDefault(_index);

var _WalletWorker = require('gittoken-web-workers/dist/Wallet.worker.js');

var _WalletWorker2 = _interopRequireDefault(_WalletWorker);

var _ledgerco = require('ledgerco');

var _ledgerco2 = _interopRequireDefault(_ledgerco);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ref2 = _jsx('h1', {}, void 0, 'Wallet Component');

var GitTokenWallet = function () {
  function GitTokenWallet(_ref) {
    var ethereumProvider = _ref.ethereumProvider,
        torvaldsProvider = _ref.torvaldsProvider;

    _classCallCheck(this, GitTokenWallet);

    this.initStore();
    this.initLedgerNano();

    this.walletWorker = new _WalletWorker2.default();

    this.walletWorker.addEventListener('message', function (msg) {
      console.log('Received Message from Worker', msg);
      var _msg$data = msg.data,
          event = _msg$data.event,
          payload = _msg$data.payload;

      switch (event) {
        case 'SAVED_KEYSTORE':
          console.log('payload', payload);
          break;
        default:
          console.log('Unhandled Message from Wallet Worker');
      }
    });

    // Move this function to a react component handler to trigger
    this.createKeystore({ password: 'test' }).then(function (addresses) {
      console.log('addresses', addresses);
    }).catch(function (error) {
      console.log('error', error);
    });

    // this.walletWorker.postMessage(JSON.stringify({
    //   event: 'WALLET_CREATE_KEYSTORE',
    //   payload: {
    //     password: 'test'
    //   }
    // }))
  }

  _createClass(GitTokenWallet, [{
    key: 'renderApp',
    value: function renderApp() {
      console.log('this.store', this.store);
      _reactDom2.default.render(_jsx(_reactRouterDom.BrowserRouter, {}, void 0, _jsx(_reactRedux.Provider, {
        store: this.store
      }, void 0, _jsx('div', {
        style: { background: 'linear-gradient(45deg, #0c0019, #493f5b)', height: '100%', color: '#fff' }
      }, void 0, _ref2))), document.getElementById('app'));
    }
  }, {
    key: 'initStore',
    value: function initStore() {
      // Create a history of your choosing (we're using a browser history in this case)
      this.history = (0, _createBrowserHistory2.default)();

      // Build the middleware for intercepting and dispatching navigation actions
      this.middleware = (0, _reactRouterRedux.routerMiddleware)(this.history);

      // Add the reducer to your store on the `router` key
      // Also apply our middleware for navigating
      this.store = (0, _redux.createStore)((0, _redux.combineReducers)(_extends({}, _index2.default, {
        router: _reactRouterRedux.routerReducer
      })), (0, _redux.applyMiddleware)(this.middleware), (0, _redux.applyMiddleware)(_reduxThunk2.default));
    }
  }, {
    key: 'createKeystore',
    value: function createKeystore(_ref3) {
      var _this = this;

      var password = _ref3.password;

      return new Promise(function (resolve, reject) {
        _lightwalletMin.keystore.createVault({ password: password }, function (error, ks) {
          if (error) {
            reject(error);
          }
          ks.keyFromPassword(password, function (error, derivedKey) {
            console.log('derivedKey', derivedKey);
            if (error) {
              reject(error);
            }
            ks.generateNewAddress(derivedKey, 3);
            _this.saveKeystore({ ks: ks }).then(function () {
              resolve(ks.getAddresses());
            }).catch(function (error) {
              reject(error);
            });
          });
        });
      });
    }
  }, {
    key: 'saveKeystore',
    value: function saveKeystore(_ref4) {
      var _this2 = this;

      var ks = _ref4.ks;

      return new Promise(function (resolve, reject) {
        _this2.walletWorker.postMessage({
          event: 'SAVE_KEYSTORE',
          payload: {
            serialized: ks.serialize()
          }
        });
        resolve();
      });
    }
  }, {
    key: 'initLedgerNano',
    value: function initLedgerNano() {
      _ledgerco2.default.comm_u2f.create_async().then(function (comm) {
        console.log('comm', comm);
      }).catch(function (error) {
        console.log('error', error);
      });
    }
  }]);

  return GitTokenWallet;
}();

exports.default = GitTokenWallet;