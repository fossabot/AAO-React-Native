// @flow

import './globalize-fetch'
import './setup-moment'
import './navigation'
import './bugsnag'

import {makeStore, initRedux} from './flux'

const store = makeStore()
initRedux(store)
