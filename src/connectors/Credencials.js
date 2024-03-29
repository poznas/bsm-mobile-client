import { allAuthHeaders, authHeader } from './AuthHeaders'
import { SecureStore } from 'expo'

const languageKey = 'lang'

const credentials = () => {

  const insertValue = async (key, value) => {
    try {
      if (value) {
        console.log('insert credentials ', key, ' : ', value)
        await SecureStore.setItemAsync(key, value)
      } else {
        console.log('delete value for: ', key)
        await SecureStore.deleteItemAsync(key)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const selectValue = async (key, defaultValue) => {
    try {
      const value = await SecureStore.getItemAsync(key)
      console.log('retrieve storage entry for ', key, ' : ', value)
      return value ? value : defaultValue
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const setFromHeaders = async (headers) =>
    allAuthHeaders.forEach(header => insertValue(header, headers[header]))

  const clear = async () =>
    allAuthHeaders.forEach(header => insertValue(header, undefined))

  const getApiHeaders = async () => {
    const headers = {}

    const setHeader = async (header) =>
      headers[header] = await selectValue(header)

    await setHeader(authHeader.refreshToken)
    await setHeader(authHeader.accessToken)

    if (headers[authHeader.refreshToken]) {
      return headers
    }
    throw Error('No refresh token available')
  }

  const getAwsAccessToken = async () => selectValue(authHeader.awsAccessToken)

  const getAwsIdentity = async () => selectValue(authHeader.awsIdentity)

  const getLanguage = async () => selectValue(languageKey, 'EN')

  const setLanguage = async (lang) => insertValue(languageKey, lang)

  return {
    getLanguage,
    setLanguage,
    setFromHeaders,
    getApiHeaders,
    getAwsAccessToken,
    getAwsIdentity,
    clear,
  }

}

export default credentials()
