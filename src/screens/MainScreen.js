import React, { Component } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import * as constant from './constants'
import * as _ from 'lodash'
import backendConnector from '../connectors/BackendConnector'
import { getTeamImage } from '../connectors/S3Connector'
import credentials from '../connectors/Credencials'
import { optionIcons } from './OptionIcons'
import { ListItem } from 'react-native-elements'
import { Styles } from './Styles'

class MainScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      privileges: undefined,
      optionLabels: [],
      isScoreBoardLoading: true,
      scores: undefined,
      teamImages: undefined,
    }
  }

  async componentDidMount() {
    const privileges = backendConnector.getMyPrivileges()
    const optionLabels = backendConnector.getDictionary('MAIN_SCREEN_OPTIONS')

    Promise.all([privileges, optionLabels]).then(results =>
      this.setState({
        privileges: results[0],
        optionLabels: results[1],
        isScoreBoardLoading: false,
        isLoading: false,
      })).then(() => {
      if (this.state.privileges.includes('PRV_AWS_RESOURCE_ACCESS')) {
        this.setState({ isScoreBoardLoading: true })

        backendConnector.getScores()
          .then(scores => this.setState({ scores: scores }))
          .then(() => this.state.scores.map(score => getTeamImage(score.team.teamId)))
          .then(results => Promise.all(results)
            .then(teamImages => this.setState({ teamImages: teamImages, isScoreBoardLoading: false })))
      }
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          <View style={Styles.scoreBoard}>
            {this.renderScoreBoard()}
          </View>
          {this.renderOptions()}
        </ScrollView>
      </View>
    )
  }

  renderScoreBoard = () =>
    !this.state.isScoreBoardLoading && this.state.scores ?
      this.state.scores.map(score => {
        const teamImageUri = this.resolveTeamImage(score)
        return <TouchableOpacity
          key={score.team.teamId}
          onPress={() => this.props.navigation.navigate('Points', { score: score, teamImageUri: teamImageUri })}
        >
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: teamImageUri }} style={{ width: 96, aspectRatio: 1 }}/>
            <Text style={{ color: score.team.color, fontWeight: 'bold', fontSize: 16 }}>
              {score.team.displayName}
            </Text>
            <Text style={{ color: score.team.color, fontWeight: 'bold', fontSize: 40 }}>
              {score.score}
            </Text>
          </View>
        </TouchableOpacity>
      })
      : <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'center' }}/>

  renderOptions() {
    if (this.state.isLoading) {
      return <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'center', margin: 48 }}/>
    }
    return this.mainOptions.map(option => this.userHasPrivileges(option.requiredPrivileges) ?
      <ListItem
        key={option.optionKey}
        leftAvatar={{ source: optionIcons[option.optionKey] }}
        title={this.resolveOptionLabel(option)}
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

  resolveOptionLabel = (option) => {
    const dictEntry = this.state.optionLabels.find(o => o.key === option.optionKey)
    return dictEntry ? dictEntry.value : option.optionKey
  }

  resolveTeamImage = (score) => this.state.teamImages.find(o => o.teamId === score.team.teamId).uri
}

export default MainScreen

const mainOption = (optionKey, requiredPrivileges, onClick) => ({
  optionKey: optionKey,
  requiredPrivileges: requiredPrivileges ? requiredPrivileges.concat('PRV_AWS_RESOURCE_ACCESS') : [],
  onClick: onClick ? onClick : () => {
  },
})
