import React, {Component} from 'react'
import GoogleSignInButton from "../components/GoogleSignInButton";
import GoogleConnector from "../connectors/GoogleConnector";
import {
  loginWithGoogleIdToken,
  refreshTokens
} from "../connectors/AuthBackendConnector"
import {ActivityIndicator, Image, View} from "react-native";
import * as constant from './constants';

class LoginScreen extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false
    }
  }

  static get buttonTitle() {
    return "Sign-In with Google";
  }

  signInWithGoogle = async () => {
    this.setState({isLoading: true});
    await GoogleConnector.signInWithGoogle().then(loginWithGoogleIdToken);
    await refreshTokens();
    this.setState({isLoading: false});
  };

  render() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
              style={{
                alignSelf: 'center',
                width: 150,
                height: 150,
                marginBottom: 20
              }}
              source={require('../../assets/bsm-logo.png')}/>
          <Image
              style={{
                alignSelf: 'center',
                width: 300,
                height: 150,
                marginBottom: 20
              }}
              source={require('../../assets/bsm-text.png')}/>
          {this.renderSignInButton()}
        </View>
    );
  }

  renderSignInButton() {
    if (this.state.isLoading) {
      return <ActivityIndicator size={"large"} color={constant.mainColor}/>
    }
    return <GoogleSignInButton onPress={this.signInWithGoogle}>
      {LoginScreen.buttonTitle}
    </GoogleSignInButton>
  }
}

export default LoginScreen
