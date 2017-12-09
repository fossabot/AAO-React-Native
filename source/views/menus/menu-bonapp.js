// @flow

import * as React from 'react'
import qs from 'querystring'
import sample from 'lodash/sample'
import moment from 'moment-timezone'
import delay from 'delay'
import retry from 'p-retry'

import LoadingView from '../components/loading'
import {NoticeView} from '../components/notice'
import {ConnectedFancyMenu as FancyMenu} from './components/fancy-menu'
import {tracker} from '../../analytics'
import bugsnag from '../../bugsnag'
import * as connector from './lib/query-bonapp'

import type {TopLevelViewPropsType} from '../types'
import type {
  BonAppMenuInfoType as MenuInfoType,
  BonAppCafeInfoType as CafeInfoType,
} from './types'

const CENTRAL_TZ = 'America/Winnipeg'

const bonappMenuBaseUrl = 'http://legacy.cafebonappetit.com/api/2/menus'
const bonappCafeBaseUrl = 'http://legacy.cafebonappetit.com/api/2/cafes'
const fetchJsonQuery = (url, query) =>
  fetchJson(`${url}?${qs.stringify(query)}`)

const BONAPP_HTML_ERROR_CODE = 'bonapp-html'

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

  requestMenu = (cafeId: string) => () =>
    fetchJsonQuery(bonappMenuBaseUrl, {cafe: cafeId})

  requestCafe = (cafeId: string) => () =>
    fetchJsonQuery(bonappCafeBaseUrl, {cafe: cafeId})

  fetchData = async (props: Props) => {
    let cafeMenu: ?MenuInfoType = null
    let cafeInfo: ?CafeInfoType = null

    try {
      ;[cafeMenu, cafeInfo] = await Promise.all([
        retry(this.requestMenu(props.cafeId), {retries: 3}),
        retry(this.requestCafe(props.cafeId), {retries: 3}),
      ])
    } catch (error) {
      if (error.message === "JSON Parse error: Unrecognized token '<'") {
        this.setState(() => ({errormsg: BONAPP_HTML_ERROR_CODE}))
      } else {
        tracker.trackException(error.message)
        bugsnag.notify(error)
        this.setState(() => ({errormsg: error.message}))
      }
    }

    this.setState(() => ({cafeMenu, cafeInfo, now: moment.tz(CENTRAL_TZ)}))
  }

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
      let msg = `Error: ${this.state.errormsg}`
      if (this.state.errormsg === BONAPP_HTML_ERROR_CODE) {
        msg =
          'Something between you and BonApp is having problems. Try again in a minute or two?'
      }
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
