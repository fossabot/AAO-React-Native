// @flow

import {Platform, Linking, StatusBar} from 'react-native'

import {tracker} from '../../analytics'
import SafariView from 'react-native-safari-view'
import {CustomTabs} from 'react-native-custom-tabs'

const setDarkContent = () => StatusBar.setBarStyle('dark-content')
const setLightContent = () => StatusBar.setBarStyle('light-content')

function genericOpen(url: string) {
	return Linking.canOpenURL(url)
		.then(isSupported => {
			if (!isSupported) {
				console.warn('cannot handle', url)
			}
			return Linking.openURL(url)
		})
		.catch(err => {
			tracker.trackException(err)
			console.error(err)
		})
}

async function iosOpen(url: string, {colors}: {colors?: WebViewColors} = {}) {
	const iosOnShowListener = () =>
		colors ? StatusBar.setBarStyle(colors.statusBar, true) : {}

	const iosOnDismissListener = () =>
		colors
			? StatusBar.setBarStyle(
					colors.statusBar === 'light-content'
						? 'light-content'
						: 'dark-content',
				)
			: {}

	SafariView.addEventListener('onShow', iosOnShowListener)
	SafariView.addEventListener('onDismiss', iosOnDismissListener)

	try {
		// SafariView.isAvailable throws if it's not available
		SafariView.isAvailable()

		return await SafariView.show({
			url,
			tintColor: colors ? colors.tint : undefined,
			barTintColor: colors ? colors.background : undefined,
		})
	} catch (err) {
		return genericOpen(url)
	} finally {
		SafariView.removeEventListener('onShow', iosOnShowListener)
		SafariView.removeEventListener('onDismiss', iosOnDismissListener)
	}
}

function androidOpen(url: string, {colors}: {colors?: WebViewColors}) {
	return CustomTabs.openURL(url, {
		showPageTitle: true,
		enableUrlBarHiding: true,
		enableDefaultShare: true,
	}).catch(() => genericOpen(url)) // fall back to opening in Chrome / Browser / platform default
}

type WebViewColors = {
	tint: string,
	background: string,
	statusBar: 'light-content' | 'dark-content',
}

export default function openUrl(
	url: string,
	{colors}: {colors?: WebViewColors} = {},
) {
	const protocol = /^(.*?):/.exec(url)

	if (protocol.length) {
		switch (protocol[1]) {
			case 'tel':
				return genericOpen(url)
			case 'mailto':
				return genericOpen(url)
			default:
				break
		}
	}

	switch (Platform.OS) {
		case 'android':
			return androidOpen(url, {colors})
		case 'ios':
			return iosOpen(url, {colors})
		default:
			return genericOpen(url)
	}
}
export {openUrl}

export function trackedOpenUrl(args: {
	url: string,
	id?: string,
	colors?: WebViewColors,
}) {
	const {url, id, colors} = args
	tracker.trackScreenView(id || url)
	return openUrl(url, {colors})
}

export function canOpenUrl(url: string) {
	// iOS navigates to about:blank when you provide raw HTML to a webview.
	// Android navigates to data:text/html;$stuff (that is, the document you passed) instead.
	if (/^(?:about|data):/.test(url)) {
		return false
	}
	return true
}
