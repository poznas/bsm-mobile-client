import React, {Component} from 'react'
import GoogleSignInButton from "../components/GoogleSignInButton";
import LoginConnector from "../connectors/LoginConnector";
import {View} from "react-native";

class LoginScreen extends Component {

  static get buttonTitle() {
    return "Sign-In with Google";
  }

  render() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <GoogleSignInButton onPress={LoginConnector.signInWithGoogle}>
            {LoginScreen.buttonTitle}
          </GoogleSignInButton>
        </View>
    );
  }
}

export default LoginScreen
