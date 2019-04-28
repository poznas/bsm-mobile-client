import React, { Component } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import * as constant from './constants'
import * as _ from 'lodash'
import backendConnector from '../connectors/BackendConnector'
import credentials from '../connectors/Credencials'
import { ListItem } from 'react-native-elements'

class MainScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      privileges: undefined,
      optionLabels: [],
      scores: undefined,
    }
  }

  async componentDidMount() {
    const privileges = backendConnector.getMyPrivileges()
    const optionLabels = backendConnector.getDictionary('MAIN_SCREEN_OPTIONS')

    Promise.all([privileges, optionLabels]).then(results =>
      this.setState({
        privileges: results[0],
        optionLabels: results[1],
        isLoading: false,
      })).then(() => {
      if (this.state.privileges.includes('PRV_AWS_RESOURCE_ACCESS')) {
        backendConnector.getScores().then(scores => this.setState({ scores: scores }))
      }
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'flex-start', flexDirection: 'column' }}>
          <View style={{
            justifyContent: 'space-around',
            alignItems: 'center',
            alignSelf: 'stretch',
            height: 160,
            backgroundColor: constant.scoreBoard.background,
          }}>
            {this.renderScoreBoard()}
          </View>
          {this.renderOptions()}
        </ScrollView>
      </View>
    )
  }

  renderScoreBoard = () => {
    if (this.state.privileges) {
      return this.state.scores ?
        this.state.scores.map(score =>
          <Text key={score.team.teamId}>
            {score.team.displayName}
          </Text>)
        : undefined
    }
    return <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'center' }}/>
  }

  renderOptions() {
    if (this.state.isLoading) {
      return <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'center', margin: 48 }}/>
    }
    console.log(this.mainOptions)
    return this.mainOptions.map(option => this.userHasPrivileges(option.requiredPrivileges) ?
      <ListItem
        key={option.optionKey}
        title={this.state.optionLabels.find(o => o.key === option.optionKey).value}
        onPress={option.onClick}
        style={{ alignSelf: 'stretch', height: 64 }}
      /> : undefined)
  }

  mainOptions = [
    mainOption('REPORT_SIDE_MISSION', ['PRV_REPORT_SM']),
    mainOption('JUDGE_RATE', ['PRV_JUDGE_RATE_SM']),
    mainOption('PROFESSOR_RATE', ['PRV_PROFESSOR_RATE_SM']),
    mainOption('PLAYING_USERS', ['PRV_JUDGE_RATE_SM']),
    mainOption('REPORT_MAIN_COMPETITION', ['PRV_ADD_MC_POINTS']),
    mainOption('MEDAL', ['PRV_ADD_MEDAL_POINTS']),
    mainOption('BET', ['PRV_ADD_BET_POINTS']),
    mainOption('ZONGLER', []),
    mainOption('RANKING', []),
    mainOption('SIDE_MISSIONS', []),
    mainOption('MAIN_COMPETITIONS', []),
    mainOption('BADGES', []),
    mainOption('MANAGE', ['PRV_EDIT_USERS', 'PRV_MASTER_LOCK']),
    mainOption('USER_PROFILE'),
    mainOption('LOGOUT', null, async () => {
      await credentials.clear()
      return this.props.navigation.navigate('Login')
    }),
  ]

  userHasPrivileges = (requiredPrivileges) =>
    _.difference(requiredPrivileges, this.state.privileges).length === 0
}

export default MainScreen

const mainOption = (optionKey, requiredPrivileges, onClick) => ({
  optionKey: optionKey,
  requiredPrivileges: requiredPrivileges ? requiredPrivileges.concat('PRV_AWS_RESOURCE_ACCESS') : [],
  onClick: onClick ? onClick : () => {
  },
})
