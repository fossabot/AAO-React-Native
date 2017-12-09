// @flow

import {type ReduxState} from '../index'
import moment from 'moment-timezone'

import {trackMenuFilters} from '../../analytics'
import {type FilterType, applyFiltersToItem} from '../../views/components/filter'

import {fetch as fetchBonappData} from '../../views/menus/lib/fetch-bonapp-data'
import {fetch as fetchGithubData} from '../../views/menus/lib/fetch-github-data'
import type {
  MenuItemContainerType,
  ProcessedMealType,
  MasterCorIconMapType,
  StationMenuType,
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

type UpdateMenuDataArgs =
  | {cafeType: 'bonapp', cafeId: string, ignoreProvidedMenus: boolean}
  | {cafeType: 'github', cafeUrl: string}

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
      const {cafeId, ignoreProvidedMenus} = args
      response = await fetchBonappData({cafeId, now, ignoreProvidedMenus})
    } else if (args.cafeType === 'github') {
      response = await fetchGithubData({url: args.cafeUrl})
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
    }  else if (response.type === 'error') {
      dispatch({
        type: UPDATE_MENU_DATA_FAILURE,
        payload: {menuName, error: response.payload},
      })
    } else {
      ;(response.type: empty)
    }
  }
}

export type Action =
  | UpdateMenuFiltersAction
  | UpdateMenuDataAction
  | UpdateMenuDataSuccessAction
  | UpdateMenuDataErrorAction

export type State = {
  +[key: string]: {
    loading: boolean,
    filters: Array<FilterType>,
    cafeMessage?: ?string,
    cafeError: ?Error,
    foodItems: MenuItemContainerType,
    meals: Array<ProcessedMealType>,
    corIcons: MasterCorIconMapType,
    name: string,
  },
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
