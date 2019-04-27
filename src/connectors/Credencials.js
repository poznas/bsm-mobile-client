import {authHeader} from "./AuthHeaders";
import {SecureStore} from "expo";

const credentials = () => {

  const insertValue = async (key, value) => {
    try {
      if (value) {
        console.log('insert credentials ', key, ' : ', value);
        await SecureStore.setItemAsync(key, value);
      } else {
        console.log('delete value for: ', key);
        await SecureStore.deleteItemAsync(key);
      }

    } catch (error) {
      console.log(error)
    }
  };

  const selectValue = async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      console.log('retrieve storage entry for ', key, ' : ', value);
      return value;
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

  const getApiHeaders = async () => {
    const headers = {};

    const setHeader = async (header) =>
        headers[header] = await selectValue(header);

    await setHeader(authHeader.refreshToken);
    await setHeader(authHeader.accessToken);

    if (headers[authHeader.refreshToken]) {
      return headers;
    }
    throw Error("No refresh token available");
  };

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
