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
  listItem: { alignSelf: 'stretch', height: 64 },
  title: { fontWeight: 'bold', fontSize: 28 },
  label: { fontWeight: 'bold', fontSize: 20 },
  subLabel: { fontStyle: 'italic', fontSize: 16 },
})
