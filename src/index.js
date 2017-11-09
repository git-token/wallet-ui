import config from '../app.config'
import Wallet from './Wallet'

const wallet = new Wallet({ ...config })

wallet.renderApp()
