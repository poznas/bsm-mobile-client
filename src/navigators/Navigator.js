import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation'
import LoginScreen from '../screens/LoginScreen'
import MainScreen from '../screens/MainScreen'
import TeamPointsListScreen from '../screens/points/TeamPointsListScreen'
import SideMissionTypesScreen from '../screens/side-mission/SideMissionTypesScreen'
import ReportSideMissionScreen from '../screens/side-mission/ReportSideMissionScreen'
import ReportsToRateScreen from '../screens/side-mission/rate/ReportsToRateScreen'

const AppStack = createStackNavigator(
  {
    Main: MainScreen,
    Points: TeamPointsListScreen,
    MissionTypes: SideMissionTypesScreen,
    ReportSideMission: ReportSideMissionScreen,
    ReportsToRate: ReportsToRateScreen,
  },
  {
    initialRouteName: 'Main',
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  }
)

const RootStack = createSwitchNavigator(
  {
    Login: LoginScreen,
    App: AppStack,
  },
  {
    initialRouteName: 'Login',
  }
)

const App = createAppContainer(RootStack)

export default App
