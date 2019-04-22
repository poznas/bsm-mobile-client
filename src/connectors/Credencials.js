import {authHeader} from "./AuthHeaders";
import {SecureStore} from "expo";

const credentials = () => {

  const insertValue = async (key, value) => {
    try {
      console.log('insert credentials ', key, ' : ', value);
      await SecureStore.setItem(key, value)
    } catch (error) {
      console.log(error)
    }
  };

  const selectValue = async (key) => {
    try {
      return await SecureStore.getItem(key);
    } catch (error) {
      console.log(error)
    }
  };

  const setFromHeaders = async (headers) =>
      [authHeader.refreshToken,
        authHeader.accessToken,
        authHeader.awsAccessToken,
        authHeader.awsIdentity]
      .forEach(header => insertValue(header, headers[header]));

  const getApiHeaders = async () =>
      [authHeader.refreshToken, authHeader.accessToken]
      .reduce((result, header) => result[header] = selectValue(header), {});

  const getAwsAccessToken = async () => selectValue(authHeader.awsAccessToken);

  const getAwsIdentity = async () => selectValue(authHeader.awsIdentity);

  return {
    setFromHeaders,
    getApiHeaders,
    getAwsAccessToken,
    getAwsIdentity
  }

};

export default credentials();
