import React from 'react'
import * as constant from '../screens/constants'
import { ActivityIndicator } from 'react-native'

export const commonActivityIndicator = (margin = 0, alignSelf = 'center') =>
  <ActivityIndicator
    size={'large'}
    color={constant.mainColor}
    style={{ alignSelf: alignSelf, margin: margin }}
  />

export const listItemArrow = {
  name: 'arrow-right',
  type: 'font-awesome',
  style: { marginRight: 10, fontSize: 15 },
}

export const getDictValue = (dictionary, key) => {
  const entry = dictionary.find(entry => entry.key === key)
  return entry ? entry.value : key
}
