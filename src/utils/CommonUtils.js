import React from 'react'
import * as constant from '../screens/constants'
import { ActivityIndicator } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

export const commonActivityIndicator = (margin = 0, alignSelf = 'center') =>
  <ActivityIndicator
    size={'large'}
    color={constant.mainColor}
    style={{ alignSelf: alignSelf, margin: margin }}
  />

export const commonOverlaySpinner = (visible, dict, key) =>
  <Spinner
    visible={visible}
    overlayColor={'rgba(0,0,0,0.5)'}
    textStyle={{ color: 'white' }}
    textContent={dictValueOrEmpty(dict, key) + '...'}
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

export const dictValueOrEmpty = (dictionary, key) => {
  if (dictionary && dictionary.length > 0) {
    return getDictValue(dictionary, key)
  }
  return ''
}
