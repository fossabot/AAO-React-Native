// @flow

import retry from 'p-retry'
import moment from 'moment'
import {tracker} from '../../../analytics'
import bugsnag from '../../../bugsnag'
import * as bonapp from './query-bonapp'
import type {
  BonAppMenuInfoType as MenuInfoType,
  BonAppCafeInfoType as CafeInfoType,
} from '../types'
import type {ActionEnum} from './fetch-types'

const bonappMenuBaseUrl = 'http://legacy.cafebonappetit.com/api/2/menus'
const bonappCafeBaseUrl = 'http://legacy.cafebonappetit.com/api/2/cafes'

const requestMenu = (cafeId: string): Promise<MenuInfoType> =>
  fetchJson(`${bonappMenuBaseUrl}?cafe=${cafeId}`)

const requestCafe = (cafeId: string): Promise<CafeInfoType> =>
  fetchJson(`${bonappCafeBaseUrl}?cafe=${cafeId}`)

type DataSuccess = {
  type: 'success',
  payload: {
    cafeMenu: MenuInfoType,
    cafeInfo: CafeInfoType,
  },
}

type DataFailure = {
  type: 'error',
  payload: Error,
}

export async function getData(args: {
  cafeId: string,
}): Promise<DataSuccess | DataFailure> {
  const {cafeId} = args
  try {
    const [cafeMenu, cafeInfo] = await Promise.all([
      retry(() => requestMenu(cafeId), {retries: 3}),
      retry(() => requestCafe(cafeId), {retries: 3}),
    ])

    return {
      type: 'success',
      payload: {cafeMenu, cafeInfo},
    }
  } catch (error) {
    if (error.message === "JSON Parse error: Unrecognized token '<'") {
      // we got back html from the server
      return {
        type: 'error',
        payload: new Error(
          'Something between you and BonApp is having problems. Try again in a minute or two?',
        ),
      }
    }

    tracker.trackException(error.message)
    bugsnag.notify(error)

    return {
      type: 'error',
      payload: error,
    }
  }
}

export async function fetch(args: {
  cafeId: string,
  now: moment,
  ignoreProvidedMenus: boolean,
}): Promise<ActionEnum> {
  const {cafeId, now, ignoreProvidedMenus = false} = args

  const response = await getData({cafeId})

  if (response.type === 'error') {
    return {
      type: 'error',
      payload: response.payload,
    }
  }

  const {cafeMenu, cafeInfo} = response.payload

  // We grab the "today" info from here because BonApp returns special
  // messages in this response, like "Closed for Christmas Break"
  const cafeMessage = bonapp.findCafeMessage({cafeId, cafeInfo, now})

  // prepare all food items from bonapp for rendering
  const foodItems = bonapp.prepareFood(cafeMenu)

  const meals = bonapp.getMeals({
    foodItems,
    ignoreProvidedMenus,
    cafeId,
    cafeMenu,
  })

  return {
    type: 'success',
    payload: {
      cafeMessage: cafeMessage,
      foodItems: foodItems,
      meals: meals,
      corIcons: cafeMenu.cor_icons,
    },
  }
}
