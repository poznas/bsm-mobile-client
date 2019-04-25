import {createAppContainer, createSwitchNavigator} from 'react-navigation'
import LoginScreen from '../screens/LoginScreen'

const RootStack = createSwitchNavigator(
    {
      Login: LoginScreen,
    },
    {
      initialRouteName: 'Login',
    }
);

const App = createAppContainer(RootStack);

export default App;
