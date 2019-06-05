import axios from 'axios/index'
import credentials from './Credencials'
import { fullPath, refreshTokens } from '../connectors/AuthBackendConnector'

const backendConnector = () => {

  const getMyPrivileges = () => sendRequest('/user/my-privileges')
  const getScores = () => sendRequest('/points/scores')

  const getTeamPoints = (teamId, page, size = 25) =>
    sendRequest('/points/team/' + teamId + '?size=' + size + '&page=' + page)

  const getSideMissionTypes = () => sendRequest('/side-mission/type/types')

  const getTeammates = () => sendRequest('/user/users/teammates')

  const getTeamDetails = (teamId) => sendRequest('/user/team/' + teamId)

  const postSideMissionReport = (body) => post('/side-mission/report', body)

  const getReportsToRate = (rater) => sendRequest('/side-mission/report/reports/' + rater)

  const getReportProofs = (reportId) => sendRequest('/side-mission/report/' + reportId + '/proofs')

  const getSideMissionType = (typeId) => sendRequest('/side-mission/type/' + typeId)

  const postReportRate = (reportId, raterType, rates) =>
    post('/side-mission/report/' + reportId + '/rate/' + raterType, rates)

  const getDictionary = async (dictName) =>
    sendRequest('/dictionary/' + dictName + '?lang=' + await credentials.getLanguage())

  const put = (url, body) => sendRequest(url, body, 'put')

  const post = (url, body) => sendRequest(url, body, 'post')

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
    getTeammates,
    getTeamDetails,
    postSideMissionReport,
    getReportsToRate,
    getReportProofs,
    getSideMissionType,
    postReportRate,
  }
}

export default backendConnector()

const maxRetryCalls = 2
