// @flow

import {type ReduxState} from '../index'
import moment from 'moment-timezone'

import {trackMenuFilters} from '../../analytics'
import {
  type FilterType,
  applyFiltersToItem,
} from '../../views/components/filter'

import {fetch as fetchBonappData} from '../../views/menus/lib/fetch-bonapp-data'
import {fetch as fetchGithubData} from '../../views/menus/lib/fetch-github-data'
import type {
  MenuItemContainerType,
  ProcessedMealType,
  MasterCorIconMapType,
  StationMenuType,
  MenuItemType,
} from '../../views/menus/types'

type Dispatch<A: Action> = (action: A | Promise<A> | ThunkAction<A>) => any
type GetState = () => ReduxState
type ThunkAction<A: Action> = (dispatch: Dispatch<A>, getState: GetState) => any

export const UPDATE_MENU_FILTERS = 'menus/UPDATE_MENU_FILTERS'
export const UPDATE_MENU_DATA_START = 'menus/UPDATE_MENU_DATA/start'
export const UPDATE_MENU_DATA_SUCCESS = 'menus/UPDATE_MENU_DATA/success'
export const UPDATE_MENU_DATA_FAILURE = 'menus/UPDATE_MENU_DATA/failure'

export type UpdateMenuFiltersAction = {
  type: 'menus/UPDATE_MENU_FILTERS',
  payload: {
    menuName: string,
    filters: Array<FilterType>,
  },
}
export function updateMenuFilters(
  menuName: string,
  filters: FilterType[],
): UpdateMenuFiltersAction {
  trackMenuFilters(menuName, filters)
  return {type: UPDATE_MENU_FILTERS, payload: {menuName, filters}}
}

export type UpdateMenuDataAction = {
  type: 'menus/UPDATE_MENU_DATA/start',
  payload: {menuName: string},
}
export type UpdateMenuDataSuccessAction = {
  type: 'menus/UPDATE_MENU_DATA/success',
  payload: {
    menuName: string,
    cafeMessage: ?string,
    foodItems: MenuItemContainerType,
    meals: Array<ProcessedMealType>,
    corIcons: MasterCorIconMapType,
  },
}
export type UpdateMenuDataErrorAction = {
  type: 'menus/UPDATE_MENU_DATA/failure',
  payload: {
    menuName: string,
    error: Error,
  },
}

type UpdateMenuDataActions =
  | UpdateMenuDataAction
  | UpdateMenuDataSuccessAction
  | UpdateMenuDataErrorAction

export type UpdateMenuDataArgs =
  | {cafeType: 'bonapp', cafeId: string, ignoreProvidedMenus?: boolean}
  | {cafeType: 'github', menuUrl: string}

export function updateMenuData(
  menuName: string,
  args: UpdateMenuDataArgs,
): ThunkAction<UpdateMenuDataActions> {
  return async (dispatch, getState) => {
    dispatch({type: UPDATE_MENU_DATA_START, payload: {menuName}})

    const state = getState()
    const now = state.app ? state.app.now : moment.tz('US/Central')

    let response = null
    if (args.cafeType === 'bonapp') {
      const {cafeId, ignoreProvidedMenus = false} = args
      response = await fetchBonappData({cafeId, now, ignoreProvidedMenus})
    } else if (args.cafeType === 'github') {
      response = await fetchGithubData({url: args.menuUrl})
    } else {
      ;(args.cafeType: empty)
    }

    if (response === null) {
      dispatch({
        type: UPDATE_MENU_DATA_FAILURE,
        payload: {menuName, error: new Error('this should never happen')},
      })
      return
    }

    if (response.type === 'success') {
      dispatch({
        type: UPDATE_MENU_DATA_SUCCESS,
        payload: {
          menuName,
          cafeMessage: response.payload.cafeMessage,
          foodItems: response.payload.foodItems,
          meals: response.payload.meals,
          corIcons: response.payload.corIcons,
        },
      })
    } else if (response.type === 'error') {
      dispatch({
        type: UPDATE_MENU_DATA_FAILURE,
        payload: {menuName, error: response.payload},
      })
    } else {
      ;(response.type: empty)
    }
  }
}

/*

  areSpecialsFiltered = filters => Boolean(filters.find(this.isSpecialsFilter))
  isSpecialsFilter = f =>
    f.enabled && f.type === 'toggle' && f.spec.label === 'Only Show Specials'

*/

/*

initial filters


  updateFilters = (props: Props) => {
    const {now, menu: {foodItems, corIcons, filters, meals}} = props

    // prevent ourselves from overwriting the filters from redux on mount
    if (filters.length) {
      return
    }

    const newFilters = buildFilters(values(foodItems), corIcons, meals, now)
    props.changeFilters(newFilters)
  }


*/

type GroupedMenu = {title: string, data: Array<MenuItemType>}

function groupMenuData(
  filters: Array<FilterType>,
  foodItems: MenuItemContainerType,
  stations: Array<StationMenuType>,
): Array<GroupedMenu> {
  const derefrenceMenuItems = menu =>
    menu.items
      // Dereference each menu item
      .map(id => foodItems[id])
      // Ensure that the referenced menu items exist,
      // and apply the selected filters to the items in the menu
      .filter(item => item && applyFiltersToItem(filters, item))

  const menusWithItems = stations
    // We're grouping the menu items in a [label, Array<items>] tuple.
    .map(menu => [menu.label, derefrenceMenuItems(menu)])
    // We only want to show stations with at least one item in them
    .filter(([_, items]) => items.length)
    // We need to map the tuples into objects for SectionList
    .map(([title, data]) => ({title, data}))

  return menusWithItems
}

export type Action =
  | UpdateMenuFiltersAction
  | UpdateMenuDataAction
  | UpdateMenuDataSuccessAction
  | UpdateMenuDataErrorAction

export type SingleMenuState = {
  loading: boolean,
  isSpecialsFilterEnabled: boolean,
  groupedMenuData: Array<GroupedMenu>,
  filters: Array<FilterType>,
  cafeMessage?: ?string,
  cafeError: ?Error,
  foodItems: MenuItemContainerType,
  meals: Array<ProcessedMealType>,
  corIcons: MasterCorIconMapType,
}

export type State = {
  +[key: string]: SingleMenuState,
}

export function menus(state: State = {}, action: Action) {
  switch (action.type) {
    // case UPDATE_MENU_FILTERS:
    //   return {
    //     ...state,
    //     [action.payload.menuName]: action.payload.filters,
    //   }

    case UPDATE_MENU_DATA_START: {
      const old = state[action.payload.menuName]
      return {
        ...state,
        [action.payload.menuName]: {
          ...old,
          loading: true,
        },
      }
    }

    case UPDATE_MENU_DATA_SUCCESS: {
      const old = state[action.payload.menuName]
      return {
        ...state,
        [action.payload.menuName]: {
          cafeError: old.cafeError,
          ...old,
          loading: false,
        },
      }
    }

    case UPDATE_MENU_DATA_FAILURE: {
      const old = state[action.payload.menuName]
      return {
        ...state,
        [action.payload.menuName]: {
          ...old,
          cafeError: old.cafeError,
          loading: false,
        },
      }
    }

    default:
      return state
  }
}
