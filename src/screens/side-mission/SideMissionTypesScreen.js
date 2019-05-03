import React, { Component } from 'react'
import { ScrollView, View } from 'react-native'
import backendConnector from '../../connectors/BackendConnector'
import { Styles } from '../Styles'
import { commonActivityIndicator, getDictValue, listItemArrow } from '../../utils/CommonUtils'
import { ListItem } from 'react-native-elements'

export default class SideMissionTypesScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      missionTypes: undefined,
      missionLabels: [],
    }
  }

  async componentDidMount() {
    const apiCalls = [
      backendConnector.getSideMissionTypes(),
      backendConnector.getDictionary('SIDE_MISSION_TYPE'),
    ]
    Promise.all(apiCalls).then(results =>
      this.setState({
        missionTypes: results[0],
        missionLabels: results[1],
        isLoading: false,
      }))
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 64 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          {this.renderMissionTypes()}
        </ScrollView>
      </View>
    )
  }

  renderMissionTypes = () =>
    !this.state.isLoading && this.state.missionTypes ?
      this.state.missionTypes.map(type =>
        <ListItem
          key={type.typeId}
          title={getDictValue(this.state.missionLabels, type.typeId)}
          style={Styles.listItem}
          rightIcon={listItemArrow}
          onPress={() => {
            type.displayName = getDictValue(this.state.missionLabels, type.typeId)
            return this.props.navigation.navigate('ReportSideMission', { missionType: type })
          }}
        />)
      : commonActivityIndicator(128, 'stretch')
}
