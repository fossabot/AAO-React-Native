// @flow

import {loadLoginCredentials} from '../../lib/login'
import buildFormData from '../../lib/formdata'
import {encode} from 'base-64'
import {type ReduxState} from '../index'
import type {PrintJob, Printer} from '../../views/stoprint/types'

type Dispatch<A: Action> = (action: A | Promise<A> | ThunkAction<A>) => any
type GetState = () => ReduxState
type ThunkAction<A: Action> = (dispatch: Dispatch<A>, getState: GetState) => any
type Action = UpdateAllPrintersAction | UpdatePrintJobsAction

const UPDATE_ALL_PRINTERS_START = 'stoprint/UPDATE_ALL_PRINTERS/START'
const UPDATE_ALL_PRINTERS_FAILURE = 'stoprint/UPDATE_ALL_PRINTERS/FAILURE'
const UPDATE_ALL_PRINTERS_SUCCESS = 'stoprint/UPDATE_ALL_PRINTERS/SUCCESS'
const UPDATE_PRINT_JOBS_START = 'stoprint/UPDATE_PRINT_JOBS/START'
const UPDATE_PRINT_JOBS_FAILURE = 'stoprint/UPDATE_PRINT_JOBS/FAILURE'
const UPDATE_PRINT_JOBS_SUCCESS = 'stoprint/UPDATE_PRINT_JOBS/SUCCESS'

type UpdateAllPrintersStartAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/START',
}

type UpdateAllPrintersFailureAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/FAILURE',
  payload: string,
}

type UpdateAllPrintersSuccessAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/SUCCESS',
  payload: Array<Printer>,
}

type UpdateAllPrintersAction =
  | UpdateAllPrintersSuccessAction
  | UpdateAllPrintersFailureAction
  | UpdateAllPrintersStartAction

type UpdatePrintJobsStartAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/START',
}

type UpdatePrintJobsFailureAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/FAILURE',
  payload: string,
}

type UpdatePrintJobsSuccessAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/SUCCESS',
  payload: Array<PrintJob>,
}

type UpdatePrintJobsAction =
  | UpdatePrintJobsSuccessAction
  | UpdatePrintJobsFailureAction
  | UpdatePrintJobsStartAction

async function logIn(username, password): Promise<boolean> {
  if (!username || !password) {
    // console.log('missing username or password')
    return false
  }
  try {
    const form = buildFormData({password: encode(password)})
    const url = `https://papercut.stolaf.edu/rpc/api/rest/internal/webclient/users/${username}/log-in`
    const result = await fetchJson(url, {method: 'POST', body: form})
    // console.log('login result', result)
    if (result.success) {
      return true
    }
  } catch (err) {
    // console.log('login threw an error')
    return false
  }
  return false
}

export function updatePrinters(): ThunkAction<UpdateAllPrintersAction> {
  return async dispatch => {
    const {username, password} = await loadLoginCredentials()
    if (!username || !password) {
      return false
    }

    dispatch({type: UPDATE_ALL_PRINTERS_START})
    const success = await logIn(username, password)
    if (!success) {
      return dispatch({
        type: UPDATE_ALL_PRINTERS_FAILURE,
        payload: 'There was a problem updating the list of printers',
      })
    }

    const url = `https://papercut.stolaf.edu:9192/rpc/api/rest/internal/mobilerelease/api/all-printers?username=${username}`
    const printers = await fetchJson(url)

    dispatch({type: UPDATE_ALL_PRINTERS_SUCCESS, payload: printers})
  }
}

export function updatePrintJobs(): ThunkAction<UpdatePrintJobsAction> {
  return async dispatch => {
    const {username, password} = await loadLoginCredentials()
    if (!username || !password) {
      // console.log('no credentials')
      return false
    }
    // console.log('yes credentials')

    dispatch({type: UPDATE_PRINT_JOBS_START})

    const success = await logIn(username, password)
    if (!success) {
      // console.log('not logged in')
      return dispatch({
        type: UPDATE_PRINT_JOBS_FAILURE,
        payload: 'There was a problem updating the print jobs',
      })
    }
    // console.log('yes logged in')

    const url = `https://papercut.stolaf.edu:9192/rpc/api/rest/internal/webclient/users/${username}/jobs/status`
    const {jobs} = await fetchJson(url)

    // console.log('data', jobs)

    dispatch({type: UPDATE_PRINT_JOBS_SUCCESS, payload: jobs})

    // console.log('done')
  }
}

export type State = {|
  jobs: Array<PrintJob>,
  printers: Array<Printer>,
  error: ?string,
  loadingPrinters: boolean,
  loadingJobs: boolean,
|}

const initialState: State = {
  error: null,
  jobs: [],
  printers: [],
  loadingPrinters: false,
  loadingJobs: false,
}

export function stoprint(state: State = initialState, action: Action) {
  switch (action.type) {
    case UPDATE_PRINT_JOBS_START:
      return {...state, loadingJobs: true, error: null}

    case UPDATE_PRINT_JOBS_FAILURE:
      return {...state, loadingJobs: false, error: action.payload}

    case UPDATE_PRINT_JOBS_SUCCESS:
      return {
        ...state,
        jobs: action.payload,
        error: null,
        loadingJobs: false,
      }

    case UPDATE_ALL_PRINTERS_START:
      return {...state, loadingJobs: true, error: null}

    case UPDATE_ALL_PRINTERS_FAILURE:
      return {...state, loadingJobs: false, error: action.payload}

    case UPDATE_ALL_PRINTERS_SUCCESS:
      return {
        ...state,
        printers: action.payload,
        error: null,
        loadingPrinters: false,
      }

    default:
      return state
  }
}
