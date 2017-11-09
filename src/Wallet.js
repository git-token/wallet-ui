import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { Switch, BrowserRouter, Route } from 'react-router-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import { keystore } from 'eth-lightwallet/dist/lightwallet.min.js'
import Tx from 'ethereumjs-tx'
import { ecsign, sha3 } from 'ethereumjs-util'

import Web3 from 'web3'
import Reducers from 'gittoken-reducers/dist/index'

import WalletWorker from 'gittoken-web-workers/dist/Wallet.worker.js'

import ledger from 'ledgerco'

export default class GitTokenWallet {
  constructor({
    ethereumProvider,
    torvaldsProvider
  }) {
    this.initStore()
    this.initLedgerNano()


    this.walletWorker = new WalletWorker()

    this.walletWorker.addEventListener('message', (msg) => {
      console.log('Received Message from Worker', msg)
      const { data: { event, payload } } = msg
      switch(event) {
        case 'SAVED_KEYSTORE':
          console.log('payload', payload)
          break;
        default:
          console.log('Unhandled Message from Wallet Worker')
      }
    })


    // Move this function to a react component handler to trigger
    this.createKeystore({ password: 'test' }).then((addresses) => {
      console.log('addresses', addresses)
    }).catch((error) => {
      console.log('error', error)
    })

    // this.walletWorker.postMessage(JSON.stringify({
    //   event: 'WALLET_CREATE_KEYSTORE',
    //   payload: {
    //     password: 'test'
    //   }
    // }))

  }

  renderApp() {
    console.log('this.store', this.store)
    ReactDOM.render(
      <BrowserRouter>
        <Provider store={this.store}>
            <div style={{ background: 'linear-gradient(45deg, #0c0019, #493f5b)', height: '100%', color: '#fff' }}>
              <h1>Wallet Component</h1>
            </div>
        </Provider>
      </BrowserRouter>,
      document.getElementById('app')
    )
  }

  initStore() {
    // Create a history of your choosing (we're using a browser history in this case)
    this.history = createHistory()

    // Build the middleware for intercepting and dispatching navigation actions
    this.middleware = routerMiddleware(this.history)

    // Add the reducer to your store on the `router` key
    // Also apply our middleware for navigating
    this.store = createStore(
      combineReducers({
        ...Reducers,
        router: routerReducer
      }),
      applyMiddleware(this.middleware),
      applyMiddleware(thunk),
    )
  }

  createKeystore({ password }) {
    return new Promise((resolve, reject) => {
      keystore.createVault({ password }, (error, ks) => {
        if (error) { reject(error) }
        ks.keyFromPassword(password, (error, derivedKey) => {
          console.log('derivedKey', derivedKey)
          if (error) { reject(error) }
          ks.generateNewAddress(derivedKey, 3);
          this.saveKeystore({ ks }).then(() => {
            resolve(ks.getAddresses())
          }).catch((error) => {
            reject(error)
          })
        })
      })
    })
  }

  saveKeystore({ ks }) {
    return new Promise((resolve, reject) => {
      this.walletWorker.postMessage({
        event: 'SAVE_KEYSTORE',
        payload: {
          serialized: ks.serialize()
        }
      })
      resolve()
    })
  }

  initLedgerNano() {
    ledger.comm_u2f.create_async().then((comm) => {
      console.log('comm', comm)
    }).catch((error) => {
      console.log('error', error)
    });
  }

}
