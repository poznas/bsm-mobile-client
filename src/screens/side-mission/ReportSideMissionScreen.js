import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'
import backendConnector from '../../connectors/BackendConnector'
import { Styles } from '../Styles'
import { commonActivityIndicator, dictValueOrEmpty } from '../../utils/CommonUtils'
import { ListItem } from 'react-native-elements'
import { CustomPicker } from 'react-native-custom-picker'

export default class ReportSideMissionScreen extends Component {
  constructor() {
    super()
    this.state = {
      missionType: {},
      dictionary: [],
      isLoadingTeammates: true,
      teammates: [],
      performingUserId: undefined,
    }
  }

  async componentDidMount() {
    this.setState({ missionType: await this.props.navigation.getParam('missionType') })

    const promises = [
      backendConnector.getTeammates(),
      backendConnector.getDictionary('REPORT_SM_SCREEN_LABELS').then(dict => this.setState({ dictionary: dict })),
    ]
    Promise.all(promises).then(results =>
      this.setState({
        teammates: results[0],
        isLoadingTeammates: false,
      }))
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          <Text style={Styles.title}>
            {this.state.missionType.displayName}
          </Text>
          <View style={{ height: 24 }}/>
          <Text style={Styles.label}>
            {dictValueOrEmpty(this.state.dictionary, 'PERFORMING_USER')}
          </Text>
          <View style={{ alignSelf: 'stretch', width: '100%' }}>
            {this.renderPerformerPicker()}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderPerformerPicker = () => this.state.isLoadingTeammates ?
    commonActivityIndicator()
    : <CustomPicker
      placeholder={dictValueOrEmpty(this.state.dictionary, 'PERFORMING_USER')}
      options={this.state.teammates}
      getLabel={item => item.username}
      onValueChange={item => item ? this.setState({ performingUserId: item.userId }) : undefined}
      optionTemplate={this.renderTeammate}
    />

  renderTeammate = ({ item }) =>
    (
      <ListItem
        style={Styles.listItem}
        leftAvatar={{ source: { uri: item.imageUrl } }}
        title={item.username}
      />
    )
}
