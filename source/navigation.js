// @flow

import {Platform, StyleSheet} from 'react-native'
import Navigation from 'react-native-navigation'
import {StackNavigator} from 'react-navigation'
import * as c from './views/components/colors'

// import CalendarView, {EventDetail as EventDetailView} from './views/calendar'
// import {ContactsView, ContactsDetailView} from './views/contacts'
// import {DictionaryView, DictionaryDetailView} from './views/dictionary'
// import {HomeView, EditHomeView} from './views/home'
import {HomeView} from './views/home'
// import StreamingView, {KSTOScheduleView} from './views/streaming'
// import {
// 	MenusView,
// 	CarletonBurtonMenuScreen,
// 	CarletonLDCMenuScreen,
// 	CarletonWeitzMenuScreen,
// 	CarletonSaylesMenuScreen,
// } from './views/menus'
// import {FilterView} from './views/components/filter'
// import NewsView from './views/news'
// import SISView from './views/sis'
// import {JobDetailView} from './views/sis/student-work/detail'
// import {
// 	BuildingHoursView,
// 	BuildingHoursDetailView,
// 	BuildingHoursProblemReportView,
// 	BuildingHoursScheduleEditorView,
// } from './views/building-hours'
// import TransportationView, {
// 	BusMap as BusMapView,
// 	OtherModesDetailView,
// } from './views/transportation'
// import SettingsView from './views/settings'
// import CreditsView from './views/settings/credits'
// import PrivacyView from './views/settings/privacy'
// import LegalView from './views/settings/legal'
// import {IconSettingsView} from './views/settings/icon'
// import {StudentOrgsView, StudentOrgsDetailView} from './views/student-orgs'
// import {FaqView} from './views/faqs'
// import HelpView from './views/help'

// const styles = StyleSheet.create({
// 	header: {
// 		backgroundColor: c.olevilleGold,
// 	},
// 	card: {
// 		...Platform.select({
// 			ios: {
// 				backgroundColor: c.iosLightBackground,
// 			},
// 			android: {
// 				backgroundColor: c.androidLightBackground,
// 			},
// 		}),
// 	},
// })

console.log(Navigation)

Navigation.registerComponent('app.Index', () => HomeView)
// Navigation.registerComponent('app.component.Filter', () => FilterView)
// Navigation.registerComponent('app.contacts.Detail', () => ContactsDetailView)
// Navigation.registerComponent('app.contacts.List', () => ContactsView)
// Navigation.registerComponent(
// 	'app.dictionary.Detail',
// 	() => DictionaryDetailView,
// )
// Navigation.registerComponent('app.dictionary.List', () => DictionaryView)
// Navigation.registerComponent('app.editHome', () => EditHomeView)
// Navigation.registerComponent('app.events.Detail', () => EventDetailView)
// Navigation.registerComponent('app.events.List', () => CalendarView)
// Navigation.registerComponent('app.help.Overview', () => HelpView)
// Navigation.registerComponent('app.hours.Detail', () => BuildingHoursDetailView)
// Navigation.registerComponent('app.hours.List', () => BuildingHoursView)
// Navigation.registerComponent(
// 	'app.hours.ReportProblem',
// 	() => BuildingHoursProblemReportView,
// )
// Navigation.registerComponent(
// 	'app.hours.ScheduleEditor',
// 	() => BuildingHoursScheduleEditorView,
// )
// Navigation.registerComponent('app.ksto.Schedule', () => KSTOScheduleView)
// Navigation.registerComponent('app.menus.Index', () => MenusView)
// Navigation.registerComponent(
// 	'app.menus.carleton.Burton',
// 	() => CarletonBurtonMenuScreen,
// )
// Navigation.registerComponent(
// 	'app.menus.carleton.LDC',
// 	() => CarletonLDCMenuScreen,
// )
// Navigation.registerComponent(
// 	'app.menus.carleton.Sayles',
// 	() => CarletonSaylesMenuScreen,
// )
// Navigation.registerComponent(
// 	'app.menus.carleton.Weitz',
// 	() => CarletonWeitzMenuScreen,
// )
// Navigation.registerComponent('app.news.Index', () => NewsView)
// Navigation.registerComponent('app.settings.Credits', () => CreditsView)
// Navigation.registerComponent('app.settings.FAQs', () => FaqView)
// Navigation.registerComponent('app.settings.Legal', () => LegalView)
// Navigation.registerComponent('app.settings.Privacy', () => PrivacyView)
// Navigation.registerComponent('app.settings.Settings', () => SettingsView)
// Navigation.registerComponent('app.settings.appIcon', () => IconSettingsView)
// Navigation.registerComponent('app.sis.Index', () => SISView)
// Navigation.registerComponent('app.streamingMedia.Index', () => StreamingView)
// Navigation.registerComponent(
// 	'app.studentOrgs.Detail',
// 	() => StudentOrgsDetailView,
// )
// Navigation.registerComponent('app.studentOrgs.List', () => StudentOrgsView)
// Navigation.registerComponent('app.studentWork.Detail', () => JobDetailView)
// Navigation.registerComponent('app.transit.BusMap', () => BusMapView)
// Navigation.registerComponent('app.transit.Index', () => TransportationView)
// Navigation.registerComponent(
// 	'app.transit.otherModes.Detail',
// 	() => OtherModesDetailView,
// )

Navigation.events().onAppLaunched(() => {
	Navigation.setRoot({
		stack: {
			children: [
				{
					component: {
						name: 'app.Index',
					},
				},
			],
		},
	})
})

// export const AppNavigator = StackNavigator(
// 	{},
// 	{
// 		navigationOptions: {
// 			headerStyle: styles.header,
// 			headerTintColor: c.white,
// 		},
// 		cardStyle: styles.card,
// 	},
// )
