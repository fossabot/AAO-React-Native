// @flow

import * as React from 'react'
import semver from 'semver'
import pkg from '../../../package.json'
import {connect} from 'react-redux'
import {ScrollView, StyleSheet} from 'react-native'
import {NoticeView} from '../components/notice'
import LoadingView from '../components/loading'
import {type TopLevelViewPropsType} from '../types'
import {type ReduxState} from '../../flux'
import {getEnabledTools} from '../../flux/parts/help'
import * as wifi from './wifi'
import {ToolView} from './tool'
import {type ToolOptions} from './types'

const CUSTOM_TOOLS = [wifi]

const shouldBeShown = conf =>
	!conf.hidden &&
	(!conf.versionRange || semver.satisfies(pkg.version, conf.versionRange))

export default class HelpView extends React.Component<Props> {
	static navigationOptions = {
		title: 'Help',
	}

	render() {
		return (
			<ScrollView style={styles.contentContainer}>
				<ReportWifiProblemView />
			</ScrollView>
		)
	}
}

type Props = TopLevelViewPropsType & ReduxStateProps & ReduxDispatchProps

export class HelpView extends React.Component<Props> {
	static navigationOptions = {
		title: 'Help',
	}

	componentWillMount() {
		this.props.getEnabledTools()
	}

	render() {
		if (this.props.fetching) {
			return <LoadingView text="Loading…" />
		}

		const views = this.props.tools
			.filter(shouldBeShown)
			.map(getToolView)
			.map(([Tool, conf]) => <Tool key={conf.key} config={conf} />)

		return (
			<ScrollView contentContainerStyle={styles.container}>
				{views.length ? views : <NoticeView text="No tools are enabled." />}
			</ScrollView>
		)
	}
}

function mapState(state: ReduxState): ReduxStateProps {
	return {
		fetching: state.help ? state.help.fetching : false,
		tools: state.help ? state.help.tools : [],
	}
}

function mapDispatch(dispatch): ReduxDispatchProps {
	return {
		getEnabledTools: () => dispatch(getEnabledTools()),
	}
}

export default connect(mapState, mapDispatch)(HelpView)

const styles = StyleSheet.create({
	contentContainer: {
		padding: 10,
	},
})
