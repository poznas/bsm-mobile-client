import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import LoginScreen from '../screens/LoginScreen'
import MainScreen from '../screens/MainScreen'

const RootStack = createSwitchNavigator(
  {
    Login: LoginScreen,
    App: MainScreen,
  },
  {
    initialRouteName: 'Login',
  }
)

const App = createAppContainer(RootStack)

export default App
