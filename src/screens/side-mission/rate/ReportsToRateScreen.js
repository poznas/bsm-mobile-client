import React, { Component } from 'react'
import { ScrollView, View } from 'react-native'
import backendConnector from '../../../connectors/BackendConnector'
import { Styles } from '../../Styles'
import { commonActivityIndicator, getDictValue } from '../../../utils/CommonUtils'
import { ListItem } from 'react-native-elements'
import moment from 'moment'

export default class ReportsToRateScreen extends Component {
  constructor() {
    super()
    this.raterType = undefined
    this.state = {
      isLoading: true,
      reports: undefined,
      missionLabels: [],
    }
  }

  async componentDidMount() {
    this.raterType = await this.props.navigation.getParam('raterType')
    const apiCalls = [
      backendConnector.getReportsToRate(this.raterType),
      backendConnector.getDictionary('SIDE_MISSION_TYPE'),
    ]
    Promise.all(apiCalls).then(results =>
      this.setState({
        reports: results[0].content,
        missionLabels: results[1],
        isLoading: false,
      }))
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 24 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          {this.renderMissionTypes()}
        </ScrollView>
      </View>
    )
  }

  renderMissionTypes = () =>
    !this.state.isLoading && this.state.reports ?
      this.state.reports.map(report => {
        const typeLabel = getDictValue(this.state.missionLabels, report.missionTypeId)
        return <ListItem
          key={report.reportId}
          leftAvatar={{ source: { uri: report.performingUser.imageUrl } }}
          title={report.performingUser.username}
          subtitle={typeLabel}
          rightTitle={moment(Date.parse(report.reportTimestamp.split('.')[0])).format('HH:mm')}
          rightSubtitle={moment(Date.parse(report.reportTimestamp.split('.')[0])).format('DD.MM.YY')}
          style={Styles.listItem}
          onPress={() => this.props.navigation
            .navigate('RateReportScreen', { report: report, typeLabel: typeLabel, raterType: this.raterType })}
        />
      })
      : commonActivityIndicator(128, 'stretch')

}
