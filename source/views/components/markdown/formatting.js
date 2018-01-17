// @flow

import glamorous from 'glamorous-native'
import {SelectableText} from './selectable'
import {Platform, Text} from 'react-native'
import {iOSUIKit, material} from 'react-native-typography'

export const BaseText = glamorous(Text)({
	...Platform.select({
		ios: iOSUIKit.bodyObject,
		android: material.body1Object,
	}),
})

export const Paragraph = glamorous(SelectableText)({
	marginVertical: 3,
})

export const BlockQuote = glamorous(Paragraph)({
	fontStyle: 'italic',
	marginLeft: 8,
})

export const Strong = glamorous.text({
	fontWeight: 'bold',
})

export const Emph = glamorous.text({
	fontStyle: 'italic',
})
