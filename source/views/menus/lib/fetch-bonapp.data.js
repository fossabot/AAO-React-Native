// @flow

import qs from 'querystring'
import retry from 'p-retry'
import {tracker} from '../../../analytics'
import bugsnag from '../../../bugsnag'
import type {
  BonAppMenuInfoType as MenuInfoType,
  BonAppCafeInfoType as CafeInfoType,
} from '../types'

const bonappMenuBaseUrl = 'http://legacy.cafebonappetit.com/api/2/menus'
const bonappCafeBaseUrl = 'http://legacy.cafebonappetit.com/api/2/cafes'

const fetchJsonQuery = (url, query) =>
  fetchJson(`${url}?${qs.stringify(query)}`)

const requestMenu = (cafeId: string) => () =>
  fetchJsonQuery(bonappMenuBaseUrl, {cafe: cafeId})

const requestCafe = (cafeId: string) => () =>
  fetchJsonQuery(bonappCafeBaseUrl, {cafe: cafeId})

type Success = {
  type: 'success',
  payload: {cafeMenu: MenuInfoType, cafeInfo: CafeInfoType},
}
type Error = {type: 'error', payload: string}

export type ActionEnum = Success | Error

export async function fetch(args: {cafeId: string}): Promise<ActionEnum> {
  const {cafeId} = args
  try {
    let cafeMenu: ?MenuInfoType = null
    let cafeInfo: ?CafeInfoType = null
    ;[cafeMenu, cafeInfo] = await Promise.all([
      retry(requestMenu(cafeId), {retries: 3}),
      retry(requestCafe(cafeId), {retries: 3}),
    ])
    return {type: 'success', payload: {cafeMenu, cafeInfo}}
  } catch (error) {
    if (error.message === "JSON Parse error: Unrecognized token '<'") {
      return {
        type: 'error',
        payload:
          'Something between you and BonApp is having problems. Try again in a minute or two?',
      }
    }
    tracker.trackException(error.message)
    bugsnag.notify(error)
    return {
      type: 'error',
      payload: error.message,
    }
  }
}
