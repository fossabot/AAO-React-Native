// @flow

import {TabNavigator} from '../components/tabbed-view'

import PrintJobsView from './print-jobs'
import PrintersView from './printers'

export default TabNavigator(
  {
    PrintersView: {screen: PrintersView},
    PrintJobsView: {screen: PrintJobsView},
  },
  {
    navigationOptions: {
      title: 'StoPrint',
    },
  },
)
