// @flow

import * as React from 'react'
import {StyleSheet, SectionList} from 'react-native'
import sample from 'lodash/sample'
import size from 'lodash/size'
import values from 'lodash/values'
import moment from 'moment-timezone'
import delay from 'delay'
import {connect} from 'react-redux'

import * as c from '../components/colors'
import LoadingView from '../components/loading'
import {applyFiltersToItem, type FilterType} from '../components/filter'
import {buildFilters} from './lib/build-filters'
import {chooseMeal} from './lib/choose-meal'
import {FilterMenuToolbar as FilterToolbar} from './components/filter-menu-toolbar'
import {FoodItemRow} from './components/food-item-row'
import {ListSeparator, ListSectionHeader} from '../components/list'
import {NoticeView} from '../components/notice'
import {type ReduxState} from '../../flux'
import {updateMenuFilters, updateMenuData} from '../../flux/parts/menus'

import type {TopLevelViewPropsType} from '../types'
import type {
  MenuItemType,
  MasterCorIconMapType,
  ProcessedMealType,
  MenuItemContainerType,
  StationMenuType,
} from './types'

const styles = StyleSheet.create({
  inner: {
    backgroundColor: c.white,
  },
  message: {
    paddingVertical: 16,
  },
})

const LEFT_MARGIN = 28
const Separator = () => <ListSeparator spacing={{left: LEFT_MARGIN}} />

type CafeProps =
  | {type: 'bonapp', cafeId: string}
  | {type: 'github', menuUrl: string}

type ReactProps = CafeProps &
  (TopLevelViewPropsType & {
    name: string,
    loadingMessage: Array<string>,
    ignoreProvidedMenus?: boolean,
  })

type UpdateMenuDataArgs =
  | {cafeType: 'bonapp', cafeId: string, ignoreProvidedMenus: boolean}
  | {cafeType: 'github', cafeUrl: string}

type ReduxDispatchProps = {
  changeFilters: (Array<FilterType>) => mixed,
  fetchMenuData: (UpdateMenuDataArgs) => mixed,
}

type ReduxStateProps = {
  now: moment,
  menu: {
    filters: Array<FilterType>,
    cafeMessage: ?string,
    cafeError: ?Error,
    foodItems: MenuItemContainerType,
    meals: Array<ProcessedMealType>,
    corIcons: MasterCorIconMapType,
  },
}

type DefaultProps = {
  applyFilters: (filters: Array<FilterType>, item: MenuItemType) => boolean,
}

type Props = ReactProps & ReduxStateProps & ReduxDispatchProps & DefaultProps

type State = {
  refreshing: boolean,
}

class PlainMenu extends React.PureComponent<Props, State> {
  static defaultProps = {
    applyFilters: applyFiltersToItem,
  }

  state = {
    refreshing: false,
  }

  // MARK: Lifecycle methods

  componentWillMount() {
    this.loadMenu(this.props)
    // this.updateFilters(this.props)
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.menu.type === 'bonapp') {
      if (this.props.menu.cafeId !== newProps.menu.cafeId) {
        this.loadMenu(newProps)
        // this.updateFilters(nextProps)
      }
    }
  }

  // MARK: Data methods

  loadMenu = async (props: Props) => {
    switch (props.type) {
      case 'bonapp': {
        // eslint-disable-next-line no-return-await
        return await props.updateMenuData({
          type: 'bonapp',
          cafeId: props.menu.cafeId,
        })
      }

      case 'github': {
        // eslint-disable-next-line no-return-await
        return await props.updateMenuData({
          type: 'github',
          menuUrl: props.menu.menuUrl,
        })
      }

      default:
        ;(props.type: empty)
    }
  }

  refresh = async (): any => {
    const start = Date.now()
    this.setState(() => ({refreshing: true}))

    await this.loadMenu(this.props)

    // wait 0.5 seconds – if we let it go at normal speed, it feels broken.
    const elapsed = Date.now() - start
    if (elapsed < 500) {
      await delay(500 - elapsed)
    }

    this.setState(() => ({refreshing: false}))
  }

  // MARK: misc methods

  updateFilters = (props: Props) => {
    const {now, menu: {foodItems, corIcons, filters, meals}} = props

    // prevent ourselves from overwriting the filters from redux on mount
    if (filters.length) {
      return
    }

    const newFilters = buildFilters(values(foodItems), corIcons, meals, now)
    props.changeFilters(newFilters)
  }

  areSpecialsFiltered = filters => Boolean(filters.find(this.isSpecialsFilter))
  isSpecialsFilter = f =>
    f.enabled && f.type === 'toggle' && f.spec.label === 'Only Show Specials'

  openFilterView = () => {
    this.props.navigation.navigate('FilterView', {
      title: `Filter ${this.props.name} Menu`,
      pathToFilters: ['menus', this.props.name],
      onChange: filters => this.props.changeFilters(filters),
    })
  }

  groupMenuData = (props: Props, stations: Array<StationMenuType>) => {
    const {applyFilters, menu: {filters, foodItems}} = props

    const derefrenceMenuItems = menu =>
      menu.items
        // Dereference each menu item
        .map(id => foodItems[id])
        // Ensure that the referenced menu items exist,
        // and apply the selected filters to the items in the menu
        .filter(item => item && applyFilters(filters, item))

    const menusWithItems = stations
      // We're grouping the menu items in a [label, Array<items>] tuple.
      .map(menu => [menu.label, derefrenceMenuItems(menu)])
      // We only want to show stations with at least one item in them
      .filter(([_, items]) => items.length)
      // We need to map the tuples into objects for SectionList
      .map(([title, data]) => ({title, data}))

    return menusWithItems
  }

  // MARK: SectionList methods

  renderSectionHeader = ({section: {title}}: any) => {
    const {now, menu: {meals, filters}} = this.props
    const {stations} = chooseMeal(meals, filters, now)
    const menu = stations.find(m => m.label === title)

    return (
      <ListSectionHeader
        spacing={{left: LEFT_MARGIN}}
        subtitle={menu ? menu.note : ''}
        title={title}
      />
    )
  }

  renderItem = ({item}: {item: MenuItemType}) => {
    const specialsFilterEnabled = this.areSpecialsFiltered(
      this.props.menu.filters,
    )
    return (
      <FoodItemRow
        badgeSpecials={!specialsFilterEnabled}
        corIcons={this.props.menu.corIcons}
        data={item}
        spacing={{left: LEFT_MARGIN}}
      />
    )
  }

  keyExtractor = (item: MenuItemType, index: number) => index.toString()

  render() {
    if (this.state.loading) {
      return <LoadingView text={sample(this.props.loadingMessage)} />
    }

    if (this.props.menu.cafeError) {
      const msg = `Error: ${this.props.menu.cafeError.message}`
      return <NoticeView buttonText="Again!" onPress={this.retry} text={msg} />
    }

    const {now, menu: {filters, meals, cafeMessage}} = this.props

    const {label: mealName, stations} = chooseMeal(meals, filters, now)
    const anyFiltersEnabled = filters.some(f => f.enabled)
    const specialsFilterEnabled = this.areSpecialsFiltered(filters)
    const groupedMenuData = this.groupMenuData(this.props, stations)

    let message = 'No items to show.'
    if (cafeMessage) {
      message = cafeMessage
    } else if (specialsFilterEnabled && stations.length === 0) {
      message =
        'No items to show. There may be no specials today. Try changing the filters.'
    } else if (anyFiltersEnabled && !size(groupedMenuData)) {
      message = 'No items to show. Try changing the filters.'
    }

    const messageView = <NoticeView style={styles.message} text={message} />

    const header = (
      <FilterToolbar
        date={now}
        filters={filters}
        onPress={this.openFilterView}
        title={mealName}
      />
    )

    return (
      <SectionList
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={messageView}
        ListHeaderComponent={header}
        data={filters}
        keyExtractor={this.keyExtractor}
        onRefresh={this.refresh}
        refreshing={this.state.refreshing}
        renderItem={this.renderItem}
        renderSectionHeader={this.renderSectionHeader}
        sections={(groupedMenuData: any)}
        style={styles.inner}
      />
    )
  }
}

const mapState = (
  state: ReduxState,
  actualProps: ReactProps,
): ReduxStateProps => {
  const name = actualProps.name || 'unknown'
  let menuInfo = null

  if (!state.menus || !state.menus.hasOwnProperty(name)) {
    menuInfo = {
      filters: [],
      cafeMessage: '',
      cafeError: new Error('Could not load menu from cache'),
      foodItems: {},
      meals: [],
      corIcons: {},
    }
  } else {
    menuInfo = state.menus[name]
  }

  let now = state.app && state.app.now
  if (!now) {
    now = moment.tz('US/Central')
  }

  return {
    menu: menuInfo,
    now: now,
  }
}

const mapDispatch = (dispatch, actualProps: ReactProps): ReduxDispatchProps => {
  return {
    changeFilters: (filters: FilterType[]) =>
      dispatch(updateMenuFilters(actualProps.name, filters)),
    fetchMenuData: (menuInfo: UpdateMenuDataArgs) =>
      dispatch(updateMenuData(actualProps.name, menuInfo)),
  }
}

export const ReduxMenu = connect(mapState, mapDispatch)(PlainMenu)
