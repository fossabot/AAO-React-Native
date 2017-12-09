// @flow

import type {
  MenuItemContainerType,
  ProcessedMealType,
  MasterCorIconMapType,
} from '../types'

type Success = {
  type: 'success',
  payload: {
    cafeMessage: ?string,
    foodItems: MenuItemContainerType,
    meals: Array<ProcessedMealType>,
    corIcons: MasterCorIconMapType,
  },
}

type Failure = {
  type: 'error',
  payload: Error,
}

export type ActionEnum = Success | Failure
