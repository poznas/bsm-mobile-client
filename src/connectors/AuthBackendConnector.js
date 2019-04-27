import axios from 'axios/index'
import {fullPath} from "./BackendConnector";
import credentials from "./Credencials";

export const loginWithGoogleIdToken = async (idToken) => {

  const params = {
    headers: {
      'X-ID-TOKEN': idToken,
    },
  };
  console.log('loginWithGoogleIdToken: ', params);

  await axios.get(fullPath("/login"), params).then(
      (data) => credentials.setFromHeaders(data.headers), console.log);
};
