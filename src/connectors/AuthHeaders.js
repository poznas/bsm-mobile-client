export const authHeader = {
  accessToken: 'authorization',
  refreshToken: 'x-refresh-token',
  awsAccessToken: 'x-aws-token',
  awsIdentity: 'x-aws-identity',
}

export const allAuthHeaders = [
  authHeader.refreshToken,
  authHeader.accessToken,
  authHeader.awsAccessToken,
  authHeader.awsIdentity,
]
