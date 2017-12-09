// // @flow

// import * as React from 'react'
// import moment from 'moment-timezone'
// import sample from 'lodash/sample'
// import LoadingView from '../components/loading'
// import {NoticeView} from '../components/notice'
// import {ConnectedFancyMenu as FancyMenu} from './components/fancy-menu'
// import {fetch as fetchGithubData} from './lib/fetch-github-data'
// import type {TopLevelViewPropsType} from '../types'
// import type {
//   MasterCorIconMapType,
//   MenuItemContainerType,
//   ProcessedMealType,
// } from './types'

// const CENTRAL_TZ = 'America/Winnipeg'
// const githubMenuBaseUrl = 'https://stodevx.github.io/AAO-React-Native'

// type Props = TopLevelViewPropsType & {
//   name: string,
//   loadingMessage: string[],
// }

// type State = {
//   error: ?Error,
//   loading: boolean,
//   now: moment,
//   foodItems: MenuItemContainerType,
//   corIcons: MasterCorIconMapType,
//   meals: ProcessedMealType[],
// }

// export class GitHubHostedMenu extends React.PureComponent<Props, State> {
//   state = {
//     error: null,
//     loading: true,
//     now: moment.tz(CENTRAL_TZ),
//     foodItems: {},
//     corIcons: {},
//     meals: [],
//   }

//   componentWillMount() {
//     this.fetchData()
//       .then(this.doneLoading)
//       .catch(this.doneLoading)
//   }

//   doneLoading = () => this.setState(() => ({loading: false}))

//   fetchData = async () => {
//     this.setState(() => ({loading: true}))

//     const result = await fetchGithubData({
//       url: `${githubMenuBaseUrl}/pause-menu.json`,
//     })

//     if (result.type === 'error') {
//       this.setState(() => ({
//         error: new Error('A problem occurred.'),
//       }))
//     } else if (result.type === 'success') {
//       const {corIcons, foodItems, meals} = result.payload

//       this.setState({
//         now: moment.tz(CENTRAL_TZ),
//         corIcons,
//         foodItems,
//         meals,
//       })
//     } else {
//       ;(result.type: empty)
//     }
//   }

//   render() {
//     if (this.state.loading) {
//       return <LoadingView text={sample(this.props.loadingMessage)} />
//     }

//     if (this.state.error) {
//       return <NoticeView text={'Error: ' + this.state.error.message} />
//     }

//     return (
//       <FancyMenu
//         foodItems={this.state.foodItems}
//         meals={this.state.meals}
//         menuCorIcons={this.state.corIcons}
//         name={this.props.name}
//         navigation={this.props.navigation}
//         now={this.state.now}
//       />
//     )
//   }
// }
