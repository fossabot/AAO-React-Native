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

async function getData(
  url,
): Promise<{
  type: 'error' | 'success',
  foodItems: Array<MenuItemType>,
  stationMenus: Array<StationMenuType>,
  corIcons: MasterCorIconMapType,
}> {
  if (process.env.NODE_ENV === 'development') {
    return {type: 'success', ...getLocalData()}
  }

  try {
    const data = await getRemoteData(url)
    return {type: 'success', ...data}
  } catch (err) {
    tracker.trackException(err.message)
    bugsnag.notify(err)

    return {type: 'error', ...getLocalData()}
  }
}

export async function fetch(args: {url: string}) {
  const {type, foodItems, stationMenus, corIcons} = await getData(args.url)

  const upgradedFoodItems: MenuItemContainerType = fromPairs(
    foodItems.map(upgradeMenuItem).map(item => [item.id, item]),
  )

  const meals = makePretendMeals({foodItems: upgradedFoodItems, stationMenus})

  return {
    type,
    payload: {foodItems: upgradedFoodItems, corIcons, meals},
  }
}
