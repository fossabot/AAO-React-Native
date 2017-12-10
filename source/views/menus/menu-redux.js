// @flow

import * as React from 'react'
import {StyleSheet, SectionList} from 'react-native'
import sample from 'lodash/sample'
import moment from 'moment-timezone'
import delay from 'delay'
import {connect} from 'react-redux'
import * as c from '../components/colors'
import LoadingView from '../components/loading'
import {chooseMeal} from './lib/choose-meal'
import {FilterMenuToolbar} from './components/filter-menu-toolbar'
import {FoodItemRow} from './components/food-item-row'
import {ListSeparator, ListSectionHeader} from '../components/list'
import {NoticeView} from '../components/notice'
import {type ReduxState} from '../../flux'
import {
  updateMenuData,
  type UpdateMenuDataArgs,
  type SingleMenuState,
} from '../../flux/parts/menus'
import type {TopLevelViewPropsType} from '../types'
import type {MenuItemType} from './types'

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

type ReactProps = TopLevelViewPropsType & {
  name: string,
  loadingMessage: Array<string>,
  ignoreProvidedMenus?: boolean,
  info: {type: 'bonapp', cafeId: string} | {type: 'github', menuUrl: string},
}

type ReduxDispatchProps = {
  fetchMenuData: (string, UpdateMenuDataArgs) => Promise<mixed>,
}

type ReduxStateProps = {
  now: moment,
  menu: SingleMenuState,
}

type Props = ReactProps & ReduxStateProps & ReduxDispatchProps

type State = {
  refreshing: boolean,
}

class PlainMenu extends React.PureComponent<Props, State> {
  state = {
    refreshing: false,
  }

  // MARK: Lifecycle methods

  componentWillMount() {
    this.loadMenu(this.props)
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.info.type === 'bonapp' && newProps.info.type === 'bonapp') {
      if (this.props.info.cafeId !== newProps.info.cafeId) {
        this.loadMenu(newProps)
      }
    }
  }

  // MARK: Data methods

  loadMenu = (props: Props) => {
    switch (props.info.type) {
      case 'bonapp':
        return props.fetchMenuData(props.name, {
          cafeType: 'bonapp',
          cafeId: props.info.cafeId,
          ignoreProvidedMenus: props.ignoreProvidedMenus,
        })

      case 'github':
        return props.fetchMenuData(props.name, {
          cafeType: 'github',
          menuUrl: props.info.menuUrl,
        })

      default: {
        ;(props.info.type: empty)
        return Promise.reject(new Error('invalid menu type'))
      }
    }
  }

  refresh = async (): any => {
    const start = Date.now()
    this.setState(() => ({refreshing: true}))

    await this.loadMenu(this.props).catch(() => {})

    // wait 0.5 seconds – if we let it go at normal speed, it feels broken.
    const elapsed = Date.now() - start
    if (elapsed < 500) {
      await delay(500 - elapsed)
    }

    this.setState(() => ({refreshing: false}))
  }

  retry = () => {}

  // MARK: misc methods

  openFilterView = () => {
    this.props.navigation.navigate('MenuFilterView', {
      title: `Filter ${this.props.name} Menu`,
      menuName: this.props.name,
    })
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
    return (
      <FoodItemRow
        badgeSpecials={!this.props.menu.isSpecialsFilterEnabled}
        corIcons={this.props.menu.corIcons}
        data={item}
        spacing={{left: LEFT_MARGIN}}
      />
    )
  }

  keyExtractor = (item: MenuItemType, index: number) => index.toString()

  render() {
    const menu = this.props.menu

    if (menu.loading) {
      return <LoadingView text={sample(this.props.loadingMessage)} />
    }

    if (menu.cafeError) {
      const msg = `Error: ${menu.cafeError.message}`
      return <NoticeView buttonText="Again!" onPress={this.retry} text={msg} />
    }

    const {now} = this.props
    const {
      meals,
      filters,
      cafeMessage,
      groupedMenuData,
      isSpecialsFilterEnabled,
    } = menu

    const {label: mealName, stations} = chooseMeal(meals, filters, now)
    const anyFiltersEnabled = filters.some(f => f.enabled)

    let message = 'No items to show.'
    if (cafeMessage) {
      message = cafeMessage
    } else if (isSpecialsFilterEnabled && stations.length === 0) {
      message =
        'No items to show. There may be no specials today. Try changing the filters.'
    } else if (anyFiltersEnabled && !groupedMenuData.length) {
      message = 'No items to show. Try changing the filters.'
    }

    const messageView = <NoticeView style={styles.message} text={message} />

    const header = (
      <FilterMenuToolbar
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
  const name = actualProps.name
  let menuInfo = state.menus && state.menus[name]

  if (!menuInfo) {
    menuInfo = {
      loading: false,
      groupedMenuData: [],
      filters: [],
      cafeMessage: '',
      cafeError: new Error('Could not load menu from cache'),
      foodItems: {},
      meals: [],
      corIcons: {},
      isSpecialsFilterEnabled: false,
    }
  }

  const now = state.app ? state.app.now : moment.tz('US/Central')

  return {
    menu: menuInfo,
    now: now,
  }
}

const mapDispatch = (dispatch): ReduxDispatchProps => {
  return {
    fetchMenuData: (menuName: string, menuInfo: UpdateMenuDataArgs) =>
      dispatch(updateMenuData(menuName, menuInfo)),
  }
}

export const ReduxMenu = connect(mapState, mapDispatch)(PlainMenu)
