// @flow

import * as c from './components/colors'

export type ViewType =
	| {
			type: 'view',
			view: string,
			title: string,
			icon: string,
			tint: string,
			gradient?: [string, string],
		}
	| {
			type: 'url',
			view: string,
			url: string,
			title: string,
			icon: string,
			tint: string,
			gradient?: [string, string],
		}

export const allViews: ViewType[] = [
	{
		type: 'view',
		view: 'app.menus.Index',
		title: 'Menus',
		icon: 'bowl',
		tint: c.emerald,
		gradient: c.grassToLime,
	},
	{
		type: 'view',
		view: 'app.sis.Index',
		title: 'SIS',
		icon: 'fingerprint',
		tint: c.goldenrod,
		gradient: c.yellowToGoldDark,
	},
	{
		type: 'view',
		view: 'app.hours.List',
		title: 'Building Hours',
		icon: 'clock',
		tint: c.wave,
		gradient: c.lightBlueToBlueDark,
	},
	{
		type: 'view',
		view: 'app.events.List',
		title: 'Calendar',
		icon: 'calendar',
		tint: c.coolPurple,
		gradient: c.magentaToPurple,
	},
	{
		type: 'url',
		url: 'https://www.stolaf.edu/personal/index.cfm',
		view: 'DirectoryView',
		title: 'Directory',
		icon: 'v-card',
		tint: c.indianRed,
		gradient: c.redToPurple,
	},
	{
		type: 'view',
		view: 'app.streamingMedia.Index',
		title: 'Streaming Media',
		icon: 'video',
		tint: c.denim,
		gradient: c.lightBlueToBlueLight,
	},
	{
		type: 'view',
		view: 'app.news.Index',
		title: 'News',
		icon: 'news',
		tint: c.eggplant,
		gradient: c.purpleToIndigo,
	},
	{
		type: 'url',
		url: 'https://www.myatlascms.com/map/index.php?id=294',
		view: 'MapView',
		title: 'Campus Map',
		icon: 'map',
		tint: c.coffee,
		gradient: c.navyToNavy,
	},
	{
		type: 'view',
		view: 'app.contacts.List',
		title: 'Important Contacts',
		icon: 'phone',
		tint: c.crimson,
		gradient: c.orangeToRed,
	},
	{
		type: 'view',
		view: 'app.transit.Index',
		title: 'Transportation',
		icon: 'address',
		tint: c.cardTable,
		gradient: c.grayToDarkGray,
	},
	{
		type: 'view',
		view: 'app.dictionary.List',
		title: 'Campus Dictionary',
		icon: 'open-book',
		tint: c.olive,
		gradient: c.pinkToHotpink,
	},
	{
		type: 'view',
		view: 'app.studentOrgs.List',
		title: 'Student Orgs',
		icon: 'globe',
		tint: c.periwinkle,
		gradient: c.tealToSeafoam,
	},
	{
		type: 'url',
		url: 'https://moodle.stolaf.edu/',
		view: 'MoodleView',
		title: 'Moodle',
		icon: 'graduation-cap',
		tint: c.cantaloupe,
		gradient: c.yellowToGoldLight,
	},
	{
		type: 'view',
		view: 'app.help.Overview',
		title: 'Report A Problem',
		icon: 'help',
		tint: c.lavender,
		gradient: c.seafoamToGrass,
	},
]

export const allViewNames = allViews.map(v => v.view)
