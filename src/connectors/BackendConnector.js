import axios from 'axios/index'
import credentials from './Credencials'
import { fullPath, refreshTokens } from '../connectors/AuthBackendConnector'

const backendConnector = () => {

  const getMyPrivileges = async () => await sendRequest('/user/my-privileges')

  const getDictionary = async (dictName) =>
    sendRequest('dictionary' + dictName + '?lang=' + await credentials.getLanguage())

  const put = async (url, body) => await sendRequest(url, body, 'put')

  const post = async (url, body) => await sendRequest(url, body, 'post')

  const sendRequest = async (url, body = {}, method = 'get', attempt = 0) => {

    const log = (message) =>
      console.log('[attempt: ' + attempt + '] ' + message)

    log('sending request: ' + method.toUpperCase() + ' ' + url)
    log('payload:')
    console.log(body)

    const response = await axios({
      url: fullPath(url),
      method: method,
      headers: await credentials.getApiHeaders(),
      data: body,
    })

    log('response code: ' + response.status)
    console.log(response.data)

    if ([401, 403].includes(response.status) && attempt < maxRetryCalls) {
      await refreshTokens()
      return await sendRequest(url, body, method, attempt + 1)
    }
    return response.data
  }

  return {
    getDictionary,
    getMyPrivileges,
  }
}

export default backendConnector()

const maxRetryCalls = 2
