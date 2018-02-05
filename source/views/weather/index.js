// @flow

import * as React from 'react'
import {
	View,
	Image,
	Platform,
	ActivityIndicator,
	StyleSheet,
} from 'react-native'
import * as c from '../components/colors'
import {iPhoneX} from '../components/device'
import {weatherImages} from '../../../images/weather-images.js'
import {Row} from '../components/layout'
import {Detail, Title} from '../components/list'
import type {TopLevelViewPropsType} from '../types'

import {CELL_MARGIN} from '../home/button'

type Props = TopLevelViewPropsType

export class WeatherView extends React.PureComponent<Props> {
	state = {
		icon: 'default',
		loading: true,
		precipChance: '',
		summary: 'Cannot get weather',
		temp: '',
	}

	componentDidMount() {
		return fetchJson(
			'https://api.darksky.net/forecast/36233efa0739977ec92610ec77699969/44.461768,-93.182817',
		)
			.then(data => {
				this.setState(() => ({
					icon: data.currently.icon,
					loading: false,
					precipChance:
						Math.round(data.currently.precipProbability * 1000) / 10,
					summary: data.minutely.summary,
					temp: Math.round(data.currently.temperature) + '°',
				}))
			})
			.catch(error => {
				console.log(error)
				this.setState(() => {
					loading: false
				})
			})
	}

	render() {
		if (this.state.loading) {
			return (
				<View style={styles.spinner}>
					<ActivityIndicator size={'small'} />
				</View>
			)
		}

		function getIcon(icon) {
			return weatherImages[icon]
		}

		return (
			<View style={[styles.container]}>
				<View style={styles.wrapper}>
					<Row justifyContent="center">
						<Title style={styles.tempText}>{this.state.temp}</Title>
						<Image style={styles.icon} source={getIcon(this.state.icon)} />
					</Row>

					<Row justifyContent="center">
						<Detail style={styles.summary}>{this.state.summary}</Detail>
					</Row>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: c.navy,
		elevation: 2,
		borderRadius: Platform.OS === 'ios' ? (iPhoneX ? 17 : 6) : 3,

		marginLeft: CELL_MARGIN,
		marginRight: CELL_MARGIN,
		marginTop: CELL_MARGIN,
		marginHorizontal: CELL_MARGIN,

		padding: 10,
		flex: 1,
	},
	wrapper: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tempText: {
		color: c.white,
		fontSize: 30,
	},
	icon: {
		marginHorizontal: 5,
		tintColor: c.white,
	},
	summary: {
		color: c.white,
		fontSize: 14,
	},
	spinner: {
		flex: -1,
		marginTop: 12,
		marginBottom: 12,
	},
})
