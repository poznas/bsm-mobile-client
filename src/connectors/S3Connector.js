import AWS from 'aws-sdk'
import * as aws from './../../secrets/aws-secrets'
import { refreshTokens } from './AuthBackendConnector'
import credentials from './Credencials'
import AmazonS3URI from 'amazon-s3-uri'

AWS.config.update({
  region: aws.region,
})

const setCredentials = async () => {

  const logins = {}

  logins[aws.identity.developerProviderName] = await credentials.getAwsAccessToken()

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: aws.identity.poolId,
    IdentityId: await credentials.getAwsIdentity(),
    Logins: logins,
  })

  AWS.config.credentials.get(err => {
    if (err) {
      console.log(err)
    }
  })
}

export const getImageByS3Url = async (url) => {
  const { bucket, key } = AmazonS3URI(url)
  return {
    url: url,
    base64Url: await getImageURI(key, 0, bucket),
  }
}

export const getTeamImage = async (teamId) => ({
  uri: await getImageURI('team-images/' + teamId + '.png'),
  teamId: teamId,
})

const getImageURI = async (fileKey, attempt = 0, bucket = 'bsm-user-media') => {

  const log = (message) =>
    console.log('[attempt : ' + attempt + '] ' + message)

  log('Get image from S3: ' + fileKey)
  await setCredentials()

  const s3 = new AWS.S3({ params: { Bucket: bucket } })

  try {
    return await s3.getObject({ Key: fileKey }).promise().then(encode)
      .then(uri => {
        log('encoded image: ' + uri.substring(0, 100) + '...')
        return uri
      })
  } catch (e) {
    log(e.message)

    await refreshTokens()
    if (attempt < maxRetryCalls) {
      return getImageURI(fileKey, attempt + 1)
    }
    return undefined
  }
}

const encode = (response) => {
  const str = response.Body.toString('base64')
  return 'data:' + response.ContentType + ';base64,' + str.replace(/.{76}(?=.)/g, '$&\n')
}

const maxRetryCalls = 2
