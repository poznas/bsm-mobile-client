import React, { Component } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import * as constant from '../constants'
import { Styles } from '../Styles'

export default class TeamPointsListScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      points: undefined,
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          <View style={Styles.scoreBoard}>
            {this.renderScoreBoard()}
          </View>
          {this.renderPoints()}
        </ScrollView>
      </View>
    )
  }

  renderScoreBoard = () => {
    return undefined
  }

  renderPoints = () => {
    if (this.state.isLoading) {
      return <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'center', margin: 48 }}/>
    }
    return undefined
  }
}
