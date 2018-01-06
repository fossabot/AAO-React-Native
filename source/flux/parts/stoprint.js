// @flow

import {loadLoginCredentials} from '../../lib/login'
import buildFormData from '../../lib/formdata'
import {type ReduxState} from '../index'

type Dispatch<A: Action> = (action: A | Promise<A> | ThunkAction<A>) => any
type GetState = () => ReduxState
type ThunkAction<A: Action> = (dispatch: Dispatch<A>, getState: GetState) => any
type Action =
  | UpdateAllPrintersAction
  | UpdatePrintJobsAction

export const UPDATE_ALL_PRINTERS_START = 'stoprint/UPDATE_ALL_PRINTERS/START'
export const UPDATE_PRINT_JOBS_START = 'stoprint/UPDATE_PRINT_JOBS/START'
export const UPDATE_ALL_PRINTERS_FAILURE =
  'stoprint/UPDATE_ALL_PRINTERS/FAILURE'
export const UPDATE_PRINT_JOBS_FAILURE = 'stoprint/UPDATE_PRINT_JOBS/FAILURE'
export const UPDATE_ALL_PRINTERS_SUCCESS =
  'stoprint/UPDATE_ALL_PRINTERS/SUCCESS'
export const UPDATE_PRINT_JOBS_SUCCESS = 'stoprint/UPDATE_PRINT_JOBS/SUCCESS'

export type Printer = {}
export type PrintJob = {}

function _logIn(username, password) {
  const form = buildFormData({password: btoa(password)})
  // console.log(form)
  const url = `https://papercut.stolaf.edu/rpc/api/rest/internal/webclient/users/${username}/log-in`
  // console.log(url)
  return fetchJson(url, {method: 'POST', body: form})
}

async function logIn(username, password): Promise<boolean> {
  if (!username || !password) {
    // console.log('missing username or password')
    return false
  }
  try {
    const result = await _logIn(username, password)
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

type UpdateAllPrintersStartAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/START',
}

type UpdateAllPrintersFailureAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/FAILURE',
}

type UpdateAllPrintersSuccessAction = {
  type: 'stoprint/UPDATE_ALL_PRINTERS/SUCCESS',
  payload: Array<Printer>,
}

type UpdateAllPrintersAction =
  | UpdateAllPrintersSuccessAction
  | UpdateAllPrintersFailureAction
  | UpdateAllPrintersStartAction

export function updatePrinters(): ThunkAction<UpdateAllPrintersAction> {
  return async (dispatch: any => any) => {
    const {username, password} = await loadLoginCredentials()
    if (!username || !password) {
      return false
    }

    dispatch({type: UPDATE_ALL_PRINTERS_START})
    const success = await logIn(username, password)
    if (!success) {
      return dispatch({type: UPDATE_ALL_PRINTERS_FAILURE})
    }

    const url = `https://papercut.stolaf.edu:9192/rpc/api/rest/internal/mobilerelease/api/all-printers?username=${username}`
    const printers = await fetchJson(url)

    dispatch({type: UPDATE_ALL_PRINTERS_SUCCESS, payload: printers})
  }
}

type UpdatePrintJobsStartAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/START',
  payload: Array<PrintJob>,
}

type UpdatePrintJobsFailureAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/FAILURE',
  payload: Array<PrintJob>,
}

type UpdatePrintJobsSuccessAction = {
  type: 'stoprint/UPDATE_PRINT_JOBS/SUCCESS',
  payload: Array<PrintJob>,
}

type UpdatePrintJobsAction =
  | UpdatePrintJobsSuccessAction
  | UpdatePrintJobsFailureAction
  | UpdatePrintJobsStartAction

export function updatePrintJobs(): ThunkAction<UpdatePrintJobsAction> {
  return async (dispatch: any => any) => {
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
      return dispatch({type: UPDATE_PRINT_JOBS_FAILURE})
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

export function stoprint(
  state: State = initialState,
  action: Action,
) {
  switch (action.type) {
    case UPDATE_PRINT_JOBS_SUCCESS:
      return {...state, jobs: action.payload, error: null, loadingJobs: false}

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
