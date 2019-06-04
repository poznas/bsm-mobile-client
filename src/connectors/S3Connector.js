import AWS from 'aws-sdk'
import * as aws from './../../secrets/aws-secrets'
import { refreshTokens } from './AuthBackendConnector'
import credentials from './Credencials'
import AmazonS3URI from 'amazon-s3-uri'
import { FileSystem } from 'expo'
import { Buffer } from 'buffer'

global.Buffer = global.Buffer || require('buffer').Buffer

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

/**
 * Download
 */
export const getThumbnail = async (url) =>
  Promise.resolve(url.replace(/\.\w+$/, '-thumbnail.jpg')).then(AmazonS3URI)
    .then(({ bucket, key }) => getImageURI(key, 0, bucket))
    .then(base64Image => ({ url: url, base64Url: base64Image }))

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

    if (attempt < maxRetryCalls) {
      await refreshTokens()
      return await getImageURI(fileKey, attempt + 1)
    }
    return undefined
  }
}

const encode = (response) => {
  const str = response.Body.toString('base64')
  return 'data:' + response.ContentType + ';base64,' + str.replace(/.{76}(?=.)/g, '$&\n')
}

/**
 * Upload
 */
export const uploadProofMedia = async (files) => {
  return await Promise.all(files.map(file => uploadFile(file.uri)))
}

const uploadFile = async (uri, attempt = 0, bucket = 'bsm-user-media') => {

  const log = (message) =>
    console.log('[attempt : ' + attempt + '] ' + message)

  await setCredentials()
  const s3 = new AWS.S3({ params: { Bucket: bucket } })
  const fileKey = await credentials.getAwsIdentity() + '/' + Date.now() + uri.split('/').pop()

  log('Put file [' + uri + '] to -> S3: |' + bucket + '| ' + fileKey)

  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingTypes.Base64 })
      .then(fileString => new Buffer(fileString, 'base64'))
      .then(buffer => s3.upload({ Key: fileKey, Body: buffer }).promise())
      .then(successData => ({
        uri: uri,
        s3Url: successData.Location,
      }))
  } catch (e) {
    console.log(e)
    log(e.message)

    if (attempt < maxRetryCalls) {
      await refreshTokens()
      return await uploadFile(uri, attempt + 1)
    }
    return undefined
  }
}

const maxRetryCalls = 2
