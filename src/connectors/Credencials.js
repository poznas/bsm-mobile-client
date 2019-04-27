import {authHeader} from "./AuthHeaders";
import {SecureStore} from "expo";

const credentials = () => {

  const insertValue = async (key, value) => {
    try {
      if(value) {
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
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log(error)
    }
  };

  const setFromHeaders = async (headers) => {
    console.log(headers);
    return [authHeader.refreshToken,
      authHeader.accessToken,
      authHeader.awsAccessToken,
      authHeader.awsIdentity]
    .forEach(header => insertValue(header, headers[header]));
  };

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
