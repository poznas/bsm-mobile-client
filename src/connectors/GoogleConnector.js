import {AppAuth, Constants} from 'expo';
import * as oath from './../../secrets/oauth-client-ids';
import {Platform} from "react-native";

const isInClient = Constants.appOwnership === 'expo';

const clientIds = Platform.select({
  android: oath.android.clientId,
  ios: oath.ios.clientId,
});

const clientId = clientIds[isInClient ? "inExpo" : "standalone"];
const packageId = isInClient ? "host.exp.exponent" : "com.bsm.mobile.expo";

const googleConnector = () => {

  const signInWithGoogle = async () => {
    try {
      const tokens = await AppAuth.authAsync({
        issuer: 'https://accounts.google.com',
        scopes: ['profile', 'email', 'openid'],
        clientId: clientId,
        redirectUrl: packageId + ":/oauthredirect"
      });
      console.log(tokens);
      return tokens.idToken;
    } catch ({message}) {
      console.log('signInWithGoogle: ' + message);
    }
  };

  return {
    signInWithGoogle
  }
};

export default googleConnector();
