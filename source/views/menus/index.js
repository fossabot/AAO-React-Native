// @flow

import * as React from 'react'
import {TabNavigator} from '../components/tabbed-view'
import {TabBarIcon} from '../components/tabbar-icon'

// import {BonAppHostedMenu} from './menu-bonapp'
import {ReduxMenu} from './menu-redux'
// import {GitHubHostedMenu} from './menu-github'
// import {CarletonCafeIndex} from './carleton-menus'
// import {BonAppPickerView} from './dev-bonapp-picker'

// export {
//   CarletonBurtonMenuScreen,
//   CarletonLDCMenuScreen,
//   CarletonWeitzMenuScreen,
//   CarletonSaylesMenuScreen,
// } from './carleton-menus'

export const MenusView = TabNavigator(
  {
    StavHallMenuView: {
      screen: ({navigation}) => (
        <ReduxMenu
          info={{
            type: 'bonapp',
            cafeId: '261',
          }}
          loadingMessage={[
            'Hunting Ferndale Turkey…',
            'Tracking wild vegan burgers…',
            '"Cooking" some lutefisk…',
            'Finding more mugs…',
            'Waiting for omlets…',
            'Putting out more cookies…',
          ]}
          name="Stav Hall"
          navigation={navigation}
        />
      ),
      navigationOptions: {
        tabBarLabel: 'Stav Hall',
        tabBarIcon: TabBarIcon('nutrition'),
      },
    },

    TheCageMenuView: {
      screen: ({navigation}) => (
        <ReduxMenu
          ignoreProvidedMenus={true}
          info={{
            type: 'bonapp',
            cafeId: '262',
          }}
          loadingMessage={[
            'Checking for vegan cookies…',
            'Serving up some shakes…',
            'Waiting for menu screens to change…',
            'Frying chicken…',
            'Brewing coffee…',
          ]}
          name="The Cage"
          navigation={navigation}
        />
      ),
      navigationOptions: {
        tabBarLabel: 'The Cage',
        tabBarIcon: TabBarIcon('cafe'),
      },
    },

    ThePauseMenuView: {
      screen: ({navigation}) => (
        <ReduxMenu
          info={{
            type: 'github',
            menuUrl:
              'https://stodevx.github.io/AAO-React-Native/pause-menu.json',
          }}
          loadingMessage={[
            'Mixing up a shake…',
            'Spinning up pizzas…',
            'Turning up the music…',
            'Putting ice cream on the cookies…',
            'Fixing the oven…',
          ]}
          name="The Pause"
          navigation={navigation}
        />
      ),
      navigationOptions: {
        tabBarLabel: 'The Pause',
        tabBarIcon: TabBarIcon('paw'),
      },
    },

    // CarletonMenuListView: {
    //   screen: CarletonCafeIndex,
    //   navigationOptions: {
    //     tabBarLabel: 'Carleton',
    //     tabBarIcon: TabBarIcon('menu'),
    //   },
    // },

    // BonAppDevToolView: {screen: BonAppPickerView},
  },
  {
    navigationOptions: {
      title: 'Menus',
    },
  },
)
