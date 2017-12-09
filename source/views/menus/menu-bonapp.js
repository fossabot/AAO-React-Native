// @flow

import * as React from 'react'
import sample from 'lodash/sample'
import moment from 'moment-timezone'
import delay from 'delay'
import LoadingView from '../components/loading'
import {NoticeView} from '../components/notice'
import {ConnectedFancyMenu as FancyMenu} from './components/fancy-menu'
import {tracker} from '../../analytics'
import bugsnag from '../../bugsnag'
import * as connector from './lib/query-bonapp'
import {fetch as fetchBonappData} from './lib/fetch-bonapp.data'
import type {TopLevelViewPropsType} from '../types'
import type {
  BonAppMenuInfoType as MenuInfoType,
  BonAppCafeInfoType as CafeInfoType,
} from './types'

const CENTRAL_TZ = 'America/Winnipeg'

type Props = TopLevelViewPropsType & {
  cafeId: string,
  ignoreProvidedMenus?: boolean,
  loadingMessage: string[],
  name: string,
}

type State = {
  errormsg: ?string,
  loading: boolean,
  refreshing: boolean,
  now: moment,
  cafeInfo: ?CafeInfoType,
  cafeMenu: ?MenuInfoType,
}

export class BonAppHostedMenu extends React.PureComponent<Props, State> {
  state = {
    errormsg: null,
    loading: true,
    refreshing: false,
    now: moment.tz(CENTRAL_TZ),
    cafeMenu: null,
    cafeInfo: null,
  }

  componentWillMount() {
    this.fetchData(this.props).then(() => {
      this.setState(() => ({loading: false}))
    })
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.cafeId !== newProps.cafeId) {
      this.fetchData(newProps)
    }
  }

  fetchData = async (props: Props) => {
    const result = await fetchBonappData({cafeId: props.cafeId})

    if (result.type === 'error') {
      const errorMessage = result.payload
      this.setState(() => ({errormsg: errorMessage}))
    } else if (result.type === 'success') {
      const {cafeMenu, cafeInfo} = result.payload
      const now = moment.tz(CENTRAL_TZ)
      this.setState(() => ({cafeMenu, cafeInfo, now}))
    } else {
      ;(result.type: empty)
    }
  }

  // all retry does is re-set `loading` and `errormsg` to falsy values
  // after a success
  retry = () => {
    this.fetchData(this.props).then(() => {
      this.setState(() => ({loading: false, errormsg: ''}))
    })
  }

  refresh = async (): any => {
    const start = Date.now()
    this.setState(() => ({refreshing: true}))

    await this.fetchData(this.props)

    // wait 0.5 seconds – if we let it go at normal speed, it feels broken.
    const elapsed = Date.now() - start
    if (elapsed < 500) {
      await delay(500 - elapsed)
    }

    this.setState(() => ({refreshing: false}))
  }

  render() {
    if (this.state.loading) {
      return <LoadingView text={sample(this.props.loadingMessage)} />
    }

    if (this.state.errormsg) {
      const msg = `Error: ${this.state.errormsg}`
      return <NoticeView buttonText="Again!" onPress={this.retry} text={msg} />
    }

    if (!this.state.cafeMenu || !this.state.cafeInfo) {
      const err = new Error(
        `Something went wrong loading BonApp cafe #${this.props.cafeId}`,
      )
      tracker.trackException(err)
      bugsnag.notify(err)

      const msg = 'Something went wrong. Email odt@stolaf.edu to let them know?'
      return <NoticeView text={msg} />
    }

    const {cafeId, ignoreProvidedMenus = false} = this.props
    const {now, cafeMenu, cafeInfo} = this.state

    // We grab the "today" info from here because BonApp returns special
    // messages in this response, like "Closed for Christmas Break"
    const specialMessage = connector.findCafeMessage({cafeId, cafeInfo, now})

    // prepare all food items from bonapp for rendering
    const foodItems = connector.prepareFood(cafeMenu)

    const meals = connector.getMeals({
      foodItems,
      ignoreProvidedMenus,
      cafeId,
      cafeMenu,
    })

    return (
      <FancyMenu
        cafeMessage={specialMessage}
        foodItems={foodItems}
        meals={meals}
        menuCorIcons={cafeMenu.cor_icons}
        name={this.props.name}
        navigation={this.props.navigation}
        now={now}
        onRefresh={this.refresh}
        refreshing={this.state.refreshing}
      />
    )
  }
}
