// @flow

import './globalize-fetch'
import './setup-moment'

import * as React from 'react'
import {StatusBar} from 'react-native'
import {Provider} from 'react-redux'
import {makeStore, initRedux} from './flux'
import bugsnag from './bugsnag'
import {tracker} from './analytics'
import {AppNavigator} from './navigation'
import type {NavigationState} from 'react-navigation'

const store = makeStore()
initRedux(store)

// gets the current screen from navigation state
function getCurrentRoute(navigationState: NavigationState): ?Object {
	if (!navigationState) {
		return null
	}
	const route = navigationState.routes[navigationState.index]
	// dive into nested navigators
	if (route.routes) {
		return getCurrentRoute(route)
	}
	return route
}
function getCurrentRouteStatusBarColor(
	navigationState: NavigationState,
): ?('light-content' | 'dark-content') {
	const route = getCurrentRoute(navigationState)
	if (!route) {
		return null
	}
	return route.params ? route.params.colors.statusBar : 'dark-content'
}
function getCurrentRouteName(navigationState: NavigationState): ?string {
	const route = getCurrentRoute(navigationState)
	if (!route) {
		return null
	}
	return route.routeName
}

type Props = {}

export default class App extends React.Component<Props> {
	trackScreenChanges(
		prevState: NavigationState,
		currentState: NavigationState,
	) {
		const currentScreen = getCurrentRouteName(currentState)
		const prevScreen = getCurrentRouteName(prevState)

		if (!currentScreen) {
			return
		}

		if (currentScreen !== prevScreen) {
			tracker.trackScreenView(currentScreen)
			bugsnag.leaveBreadcrumb(currentScreen, {
				type: 'navigation',
				previousScreen: prevScreen,
			})
		}

		const statusBarColor = getCurrentRouteStatusBarColor(currentState)
		if (statusBarColor) {
			StatusBar.setBarStyle(statusBarColor, true)
		}
	}

	render() {
		return (
			<Provider store={store}>
				<AppNavigator onNavigationStateChange={this.trackScreenChanges} />
			</Provider>
		)
	}
}
