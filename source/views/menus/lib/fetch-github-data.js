// @flow

import fromPairs from 'lodash/fromPairs'
import filter from 'lodash/filter'
import {tracker} from '../../../analytics'
import bugsnag from '../../../bugsnag'
import {upgradeMenuItem, upgradeStation} from './process-menu-shorthands'
import {data as fallbackMenu} from '../../../../docs/pause-menu.json'
import type {
  MenuItemType,
  MasterCorIconMapType,
  StationMenuType,
  MenuItemContainerType,
} from '../types'
import type {ActionEnum} from './fetch-types'

function makePretendMeals(args: {
  foodItems: MenuItemContainerType,
  stationMenus: Array<StationMenuType>,
}) {
  const stationMenus = args.stationMenus.map((menu, index) => ({
    ...upgradeStation(menu, index),
    items: filter(args.foodItems, item => item.station === menu.label).map(
      item => item.id,
    ),
  }))

  return [
    {
      label: 'Menu',
      stations: stationMenus,
      starttime: '0:00',
      endtime: '23:59',
    },
  ]
}

async function getRemoteData(url) {
  const container = await fetchJson(url)
  const data = container.data

  return {
    foodItems: data.foodItems || [],
    stationMenus: data.stationMenus || [],
    corIcons: data.corIcons || {},
  }
}

function getLocalData() {
  return {
    foodItems: fallbackMenu.foodItems || [],
    stationMenus: fallbackMenu.stationMenus || [],
    corIcons: fallbackMenu.corIcons || {},
  }
}

type DataResponse = {
  foodItems: Array<MenuItemType>,
  stationMenus: Array<StationMenuType>,
  corIcons: MasterCorIconMapType,
}

async function getData(url): Promise<DataResponse> {
  if (process.env.NODE_ENV === 'development') {
    return getLocalData()
  }

  try {
    return await getRemoteData(url)
  } catch (err) {
    tracker.trackException(err.message)
    bugsnag.notify(err)

    return getLocalData()
  }
}

export async function fetch(args: {url: string}): Promise<ActionEnum> {
  const {foodItems, stationMenus, corIcons} = await getData(
    args.url,
  )

  const upgradedFoodItems: MenuItemContainerType = fromPairs(
    foodItems.map(upgradeMenuItem).map(item => [item.id, item]),
  )

  const meals = makePretendMeals({foodItems: upgradedFoodItems, stationMenus})

  return {
    type: 'success',
    payload: {
      cafeMessage: null,
      foodItems: upgradedFoodItems,
      corIcons,
      meals,
    },
  }
}
