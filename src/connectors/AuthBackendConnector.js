import axios from 'axios/index'
import credentials from './Credencials'

export const fullPath = (path) => ['http://bsm.pub/api', path].join('')

export const loginWithGoogleIdToken = async (idToken) => {

  const params = {
    headers: {
      'X-ID-TOKEN': idToken,
    },
  }
  console.log('loginWithGoogleIdToken: ', params)

  await axios.get(fullPath('/login'), params)
    .then((data) => credentials.setFromHeaders(data.headers), console.log)
}

export const refreshTokens = async () => {

  const params = { headers: await credentials.getApiHeaders() }

  console.log('refreshTokens: ', params)

  await axios.get(fullPath('/refresh-token'), params)
    .then((data) => credentials.setFromHeaders(data.headers))
}
