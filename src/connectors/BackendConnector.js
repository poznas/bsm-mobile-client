import axios from 'axios/index'
import credentials from './Credencials'
import { fullPath, refreshTokens } from '../connectors/AuthBackendConnector'

const backendConnector = () => {

  const getMyPrivileges = async () => await sendRequest('/user/my-privileges')
  const getScores = async () => await sendRequest('/points/scores')

  const getTeamPoints = async (teamId, page, size = 25) =>
    await sendRequest('/points/team/' + teamId + '?size=' + size + '&page=' + page)

  const getSideMissionTypes = async () => await sendRequest('/side-mission/type/types')

  const getDictionary = async (dictName) =>
    sendRequest('/dictionary/' + dictName + '?lang=' + await credentials.getLanguage())

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
    }).catch(error => error.response)

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
    getScores,
    getTeamPoints,
    getSideMissionTypes,
  }
}

export default backendConnector()

const maxRetryCalls = 2
