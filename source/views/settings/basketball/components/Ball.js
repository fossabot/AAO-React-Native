// @flow
import React, {Component} from 'react'
import {StyleSheet, TouchableOpacity, Image} from 'react-native'
import propTypes from 'prop-types'
import {AppLogo} from '../../../components/logo'

type Props = {
	onStart: () => any,
	radius: number,
	rotate: number,
	scale: number,
	x: number,
	y: number,
}

export default class Ball extends React.PureComponent<Props> {
	static defaultProps = {
		onStart: () => {},
		x: 0,
		y: 0,
		radius: 48,
		rotate: 0,
		scale: 1,
	}

	render() {
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPressIn={e => {
					this.xIn = e.nativeEvent.locationX
					this.yIn = e.nativeEvent.locationY
					this.initialPageY = e.nativeEvent.pageY
					this.initialPageX = e.nativeEvent.pageX
				}}
				onPressOut={e => {
					if (this.xIn !== null) {
						// e.nativeEvent.locationX and locationY aren't updated on Android
						// (remaing the same as onPressIn) in 0.24, so we need to calculate
						// it manually
						let dx = e.nativeEvent.pageX - this.initialPageX
						let dy = e.nativeEvent.pageY - this.initialPageY
						this.xOut = this.xIn + dx
						this.yOut = this.yIn + dy

						const angle =
							Math.atan2(this.yOut - this.yIn, this.xOut - this.xIn) *
							180 /
							Math.PI
						this.props.onStart(angle + 90)
						// this.props.onStart(2);

						this.initialPageX = null
						this.initialPageY = null
						this.xIn = null
						this.yIn = null
						this.xOut = null
						this.yOut = null
					}
				}}
				style={[
					styles.ballContainer,
					{
						width: this.props.radius * 2,
						height: this.props.radius * 2,
						left: this.props.x,
						bottom: this.props.y,
					},
				]}
			>
				<AppLogo
					style={[
						{
							width: this.props.radius * 2,
							height: this.props.radius * 2,
							borderRadius: this.props.radius,
							backgroundColor: 'transparent',
							transform: [
								{rotate: this.props.rotate + 'deg'},
								{scale: this.props.scale},
							],
						},
					]}
				/>
			</TouchableOpacity>
		)
	}
}

const styles = StyleSheet.create({
	ballContainer: {
		position: 'absolute',
		backgroundColor: 'transparent',
	},
})