import React, {Component} from 'react'
import GoogleSignInButton from "../components/GoogleSignInButton";
import GoogleConnector from "../connectors/GoogleConnector";
import {loginWithGoogleIdToken} from "../connectors/AuthBackendConnector"
import {View} from "react-native";

class LoginScreen extends Component {

  static get buttonTitle() {
    return "Sign-In with Google";
  }

  signInWithGoogle = async () => {
    await GoogleConnector.signInWithGoogle().then(loginWithGoogleIdToken);
  };

  render() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <GoogleSignInButton onPress={this.signInWithGoogle}>
            {LoginScreen.buttonTitle}
          </GoogleSignInButton>
        </View>
    );
  }
}

export default LoginScreen
