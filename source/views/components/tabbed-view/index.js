// @flow

import {Platform} from 'react-native'
import {
	TabNavigator as TabNav,
	NavigationScreenRouteConfig,
} from 'react-navigation'
import * as c from '../colors'

type ComponentType = (
	screens: {[key: string]: NavigationScreenRouteConfig},
	options: any, // I don't know how to type this better…
	// the package provides a bunch of types… but it doesn't even use some
	// of them??? and none seem to be the combination of args to the second
	// arg of TabNavigator.
) => TabNav

export const TabNavigator: ComponentType = (screens, options) => {
	return TabNav(screens, ({navigation}: any) => {
		console.log(screens, options, navigation)

		if (typeof options === 'function') {
			options = options({navigation})
		}

		const inputTabBarOptions = options.tabBarOptions || {}
		const inputNavigationOptions = options.navigationOptions || {}

		return {
			backBehavior: 'none',
			lazy: true,
			swipeEnabled: Platform.OS !== 'ios',
			...options,
			navigationOptions: {
				headerTintColor: navigation.state.params.colors.tint,
				headerStyle: {
					backgroundColor: navigation.state.params.colors.background,
				},
				// headerTintColor: c.sto.lime,
				// headerStyle: {backgroundColor: c.sto.teal},
				...inputNavigationOptions,
			},
			tabBarOptions: {
				...Platform.select({
					android: {
						inactiveTintColor: 'rgba(255, 255, 255, 0.7)',
					},
					ios: {
						activeTintColor: c.sto.teal,
					},
				}),
				scrollEnabled: Platform.OS !== 'ios',
				...inputTabBarOptions,
				style: {
					...Platform.select({
						android: {
							backgroundColor: c.sto.navy,
							height: 48,
						},
					}),
					...(inputTabBarOptions.style || {}),
				},
				labelStyle: {
					...Platform.select({
						ios: {
							fontFamily: 'System',
						},
						android: {
							fontFamily: 'sans-serif-condensed',
							fontSize: 14,
							minWidth: 100, // moved this here from `tabStyle` not cut off text...
						},
					}),
					...(inputTabBarOptions.labelStyle || {}),
				},
			},
		}
	})
}
