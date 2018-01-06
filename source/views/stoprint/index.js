// @flow

import React from 'react'
import {SectionList, StyleSheet, View, Text, Button} from 'react-native'
import {connect} from 'react-redux'
import {type ReduxState} from '../../flux'
import {ListEmpty} from '../components/list'
import {updatePrinters, updatePrintJobs} from '../../flux/parts/stoprint'
import type {
  PrintJob,
  HeldJob,
  Printer,
} from './types'
import {
  ListRow,
  ListSeparator,
  ListSectionHeader,
  Detail,
  Title,
} from '../components/list'
import type {TopLevelViewPropsType} from '../types'
import toPairs from 'lodash/toPairs'
import groupBy from 'lodash/groupBy'
import delay from 'delay'

const styles = StyleSheet.create({
  list: {
    paddingTop: 5,
    marginHorizontal: 5,
  },
})

type ReactProps = TopLevelViewPropsType

type ReduxStateProps = {
  printers: Array<Printer>,
  jobs: Array<PrintJob>,
  error: ?string,
  loading: boolean,
  loginState: string,
}

type ReduxDispatchProps = {
  updatePrinters: () => any,
  updatePrintJobs: () => Promise<any>,
}

type Props = ReactProps & ReduxDispatchProps & ReduxStateProps

class PrintReleaseView extends React.PureComponent<Props> {
  static navigationOptions = {
    title: 'StoPrint',
  }

  componentWillMount = () => {
    this.refresh()
  }

  refresh = async (): any => {
    let start = Date.now()

    await this.fetchData()
    // console.log('data returned')

    // wait 0.5 seconds – if we let it go at normal speed, it feels broken.
    let elapsed = start - Date.now()
    if (elapsed < 500) {
      await delay(500 - elapsed)
    }
  }

  fetchData = () => {
    return this.props.updatePrintJobs()
  }

  keyExtractor = (item: PrintJob) => item.printerName

  openSettings = () => {
    this.props.navigation.navigate('SettingsView')
  }

  renderItem = ({item}: {item: PrintJob}) => (
    <ListRow>
      <Title>{item.documentName}</Title>
    </ListRow>
  )

  render() {
    if (this.props.loginState !== 'logged-in') {
      return (
        <View>
          <Text>You are not logged in.</Text>
          <Button onPress={this.openSettings} title="Open Settings" />
        </View>
      )
    }

    const jobs = toPairs(groupBy(this.props.printers, j => j.printerName)).map(
      ([title, data]) => ({title, data}),
    )

    return (
      <SectionList
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<ListEmpty mode="bug" />}
        keyExtractor={this.keyExtractor}
        onRefresh={this.refresh}
        refreshing={this.props.loading}
        renderItem={this.renderItem}
        sections={jobs}
        style={styles.list}
      />
    )
  }
}

function mapStateToProps(state: ReduxState): ReduxStateProps {
  return {
    printers: state.stoprint ? state.stoprint.printers : [],
    jobs: state.stoprint ? state.stoprint.jobs : [],
    error: state.stoprint ? state.stoprint.error : null,
    loading: state.stoprint ? state.stoprint.loadingJobs || state.stoprint.loadingPrinters : false,
    loginState: state.settings ? state.settings.loginState : 'logged-out',
  }
}

function mapDispatchToProps(dispatch): ReduxDispatchProps {
  return {
    updatePrinters: () => dispatch(updatePrinters()),
    updatePrintJobs: () => dispatch(updatePrintJobs()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintReleaseView)
