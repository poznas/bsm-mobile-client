import React, { Component } from 'react'
import GoogleSignInButton from '../components/GoogleSignInButton'
import GoogleConnector from '../connectors/GoogleConnector'
import credentials from '../connectors/Credencials'
import { loginWithGoogleIdToken } from '../connectors/AuthBackendConnector'
import { Image, View } from 'react-native'
import { commonActivityIndicator } from '../utils/CommonUtils'

class LoginScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
    }
  }

  static get buttonTitle() {
    return 'Sign-In with Google'
  }

  async componentDidMount() {
    credentials.getApiHeaders().then(
      () => this.props.navigation.navigate('App'),
      () => this.setState({ isLoading: false })
    )
  }

  signInWithGoogle = async () => {
    this.setState({ isLoading: true })
    await GoogleConnector.signInWithGoogle().then(loginWithGoogleIdToken)
    this.setState({ isLoading: false })
    this.props.navigation.navigate('App')
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          style={{
            alignSelf: 'center',
            width: 150,
            height: 150,
            marginBottom: 20,
          }}
          source={require('../../assets/bsm-logo.png')}/>
        <Image
          style={{
            alignSelf: 'center',
            width: 300,
            height: 150,
            marginBottom: 20,
          }}
          source={require('../../assets/bsm-text.png')}/>
        {this.renderSignInButton()}
      </View>
    )
  }

  renderSignInButton() {
    if (this.state.isLoading) {
      return commonActivityIndicator()
    }
    return <GoogleSignInButton onPress={this.signInWithGoogle}>
      {LoginScreen.buttonTitle}
    </GoogleSignInButton>
  }
}

export default LoginScreen
