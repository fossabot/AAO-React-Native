// @flow

import * as React from 'react'
import * as c from '../../../components/colors'
import openUrl from '../../../components/open-url'
import glamorous from 'glamorous-native'
import {setSaturation, setLightness} from 'polished'
import type {PosterInfo} from '../types'

type PosterProps = {
	sizes: Array<PosterInfo>,
	ideal: number,
	tint: string,
	viewport: {
		width: number,
		height: number,
	},
}

const PosterImage = (props: PosterProps) => {
	const {sizes, ideal, viewport} = props

	// TODO: find the largest size beneath `ideal`
	const poster = sizes.find(p => p.width === ideal)

	// TODO: provide a fallback image
	const uri = poster ? poster.url : ''

	return (
		<glamorous.Image
			accessibilityLabel="Movie Poster"
			borderRadius={8}
			// defaultSource
			height={viewport.width / 3 * 1.5}
			overflow="hidden"
			resizeMode="cover"
			source={{uri}}
			width={viewport.width / 3}
		/>
	)
}

export const Poster = (props: PosterProps & {left: number}) => {
	// TODO: find way to avoid backgroundColor:transparent on wrapper
	return (
		<glamorous.View
			backgroundColor={c.transparent}
			//bottom={0}
			//left={props.left}
			//position="absolute"
			shadowColor={setLightness(0.35, setSaturation(0.25, props.tint))}
			shadowOffset={{height: 4, width: 0}}
			shadowOpacity={0.8}
			shadowRadius={12}
		>
			<PosterImage {...props} />
		</glamorous.View>
	)
}
