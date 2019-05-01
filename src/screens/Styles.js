import * as constant from './constants'
import { StyleSheet } from 'react-native'

export const Styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    alignItems: 'flex-start',
    flexDirection: 'column',
    paddingBottom: 8,
  },
  scoreBoard: {
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    height: 200,
    paddingTop: 28,
    backgroundColor: constant.scoreBoard.background,
  },
})
