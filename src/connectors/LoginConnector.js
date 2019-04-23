import {AppAuth} from 'expo-app-auth';
import * as Constants from 'expo-constants';
import {GoogleSignIn} from 'expo-google-sign-in';
import * as oath from './../../secrets/oauth-client-ids';
import * as Platform from "react-native";

const {OAuthRedirect, URLSchemes} = AppAuth;

const isInClient = Constants.appOwnership === 'expo';
if (isInClient) {
  GoogleSignIn.allowInClient();
}

const clientIdForUseInTheExpoClient = oath.web.clientId;

const clientIdForUseInStandalone = Platform.select({
  android: oath.android.clientId,
  ios: oath.ios.clientId,
});

const clientId = isInClient
    ? clientIdForUseInTheExpoClient
    : clientIdForUseInStandalone;

const loginConnector = () => {

  const signInWithGoogle = async () => {

  }

};

export default loginConnector();
