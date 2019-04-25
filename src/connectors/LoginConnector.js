import {Constants, GoogleSignIn} from 'expo';
import * as oath from './../../secrets/oauth-client-ids';
import {Platform} from "react-native";

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
    try {
      await GoogleSignIn.initAsync({
        scopes: ["profile", "email", "openid"],
        isOfflineEnabled: true,
        isPromptEnabled: true,
        clientId,
      });
      await GoogleSignIn.askForPlayServicesAsync();
      const data = await GoogleSignIn.signInAsync();
      if (data.type === 'success') {
        console.log("google login success");
        console.log(data);
      }
    } catch ({message}) {
      console.log('signInWithGoogle: ' + message);
    }
  };

  return {
    signInWithGoogle
  }
};

export default loginConnector();
