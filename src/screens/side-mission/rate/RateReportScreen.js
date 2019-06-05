import React, { Component } from 'react'
import { Image, Picker, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Button, ListItem } from 'react-native-elements'
import NumericInput from 'react-native-numeric-input'
import backendConnector from '../../../connectors/BackendConnector'
import { getThumbnail } from '../../../connectors/S3Connector'
import { Styles } from '../../Styles'
import { commonActivityIndicator, commonOverlaySpinner, dictValueOrEmpty } from '../../../utils/CommonUtils'

export default class RateReportScreen extends Component {
  constructor() {
    super()
    this.report = undefined
    this.raterType = undefined
    this.missionTypeLabel = undefined
    this.state = {
      labelDictionary: undefined,
      proofs: undefined,
      loadingThumbnails: true,
      proofThumbnails: [],
      performerTeam: {},
      missionType: undefined,
      missionSpecificLabels: [],
      paramRates: {},
      disableSendAction: true,
      sendingRate: false,
    }
  }

  async componentDidMount() {
    this.report = await this.props.navigation.getParam('report')
    this.missionTypeLabel = await this.props.navigation.getParam('typeLabel')
    this.raterType = await this.props.navigation.getParam('raterType')

    const getProofMedia = backendConnector.getReportProofs(this.report.reportId)
      .then(proofs => this.setState({ proofs: proofs }))
      .then(() => Promise.all(this.state.proofs.map(proof => getThumbnail(proof.awsS3Url))))
      .then(thumbs => this.setState({
        proofThumbnails: thumbs,
        loadingThumbnails: false,
      }))

    const getMissionType = backendConnector.getSideMissionType(this.report.missionTypeId)
      .then(typeDetails => this.setState({ missionType: typeDetails }))
      .then(() => backendConnector.getDictionary(this.state.missionType.dictionaryName))
      .then(missionDict => this.setState({ missionSpecificLabels: missionDict }))

    const getPerformerTeam = backendConnector.getTeamDetails(this.report.performingUser.teamId)
      .then(team => this.setState({ performerTeam: team }))

    const loadScreenLabels = backendConnector.getDictionary('RATE_REPORT_SCREEN_LABELS')
      .then(dict => this.setState({ labelDictionary: dict }))

    await Promise.all([getProofMedia, getMissionType, getPerformerTeam, loadScreenLabels])
      .then(() => this.setState({ disableSendAction: false }))
  }

  setRate(param, rate) {
    const rates = this.state.paramRates
    rates[param.symbol] = rate
    console.log('rates:', rates)
    this.setState({ paramRates: rates })
  }

  postRate = async () => {
    this.setState({ sendingRate: true })
    await backendConnector.postReportRate(this.report.reportId, this.raterType, this.state.paramRates)
      .then(() => this.setState({ sendingRate: false }))
      .then(() => this.props.navigation.popToTop())
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {commonOverlaySpinner(this.state.sendingRate, this.state.labelDictionary, 'SENDING_RATE')}
        <ScrollView contentContainerStyle={[Styles.scrollView, { paddingTop: 24 }]}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
            contentContainerStyle={Styles.horizontalScrollView}>
            {this.renderProofs()}
          </ScrollView>
          <View style={{ flex: 15, alignSelf: 'stretch', width: '100%', paddingTop: 12 }}>
            <Text style={{ ...Styles.title, alignSelf: 'center' }}>
              {this.missionTypeLabel}
            </Text>
            {this.renderPerformer()}
            {this.renderParams()}
            {this.renderSendButton()}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderProofs = () =>
    !this.state.loadingThumbnails && this.state.proofThumbnails ?
      this.state.proofThumbnails.map(thumb =>
        <TouchableOpacity
          key={thumb.url}
        >
          {this.renderThumbnail(thumb)}
        </TouchableOpacity>)
      : commonActivityIndicator()

  renderThumbnail = (thumb) => thumb.base64Url ?
    <Image source={{ uri: thumb.base64Url }} style={{ width: 128, height: 128 }}/>
    : <View style={{ width: 128, height: 128, backgroundColor: 'black' }}/>

  renderPerformer = () => !this.report ? undefined
    : <ListItem
      leftAvatar={{ source: { uri: this.report.performingUser.imageUrl } }}
      title={this.report.performingUser.username}
      rightTitle={this.state.performerTeam.displayName}
      rightTitleStyle={{ ...Styles.subBoldLabel, color: this.state.performerTeam.color }}
      style={Styles.listItem}
    />

  renderParams = () => !this.state.missionType ? undefined
    : this.state.missionType.performParams
      .filter(param => param.toRateBy === this.raterType)
      .map(param =>
        <View key={param.symbol} style={{ alignSelf: 'stretch', width: '100%', marginVertical: 8, padding: 16 }}>
          <Text style={Styles.label}>
            {dictValueOrEmpty(this.state.missionSpecificLabels, param.hint)}
          </Text>
          {this.renderParamRateInput(param)}
        </View>)

  renderParamRateInput = (param) => {
    switch (param.type) {
    case 'STRING_PICKER':
      return <Picker
        selectedValue={String(this.state.paramRates[param.symbol])}
        onValueChange={value => this.setRate(param, parseFloat(value))}>
        {this.getPickerItemValues(param)}
      </Picker>
    case 'LIMITED_INTEGER':
      return <NumericInput
        value={this.state.paramRates[param.symbol]}
        valueType={'integer'}
        minValue={1}
        maxValue={parseInt(param.availableValuesSource, 10)}
        onChange={value => this.setRate(param, value)}
      />
    case 'UNLIMITED_DECIMAL':
      return <NumericInput
        value={this.state.paramRates[param.symbol]}
        valueType={'real'}
        minValue={0.01}
        step={0.5}
        onChange={value => this.setRate(param, parseFloat(value))}
      />
    case 'BOOLEAN':
      return <Picker
        selectedValue={String(this.state.paramRates[param.symbol])}
        onValueChange={value => this.setRate(param, parseInt(value, 10))}>
        <Picker.Item label = "Y" value = "1" />
        <Picker.Item label = "N" value = "0" />
      </Picker>
    default:
      return undefined
    }
  }

  getPickerItemValues = (param) => {
    const tuples = param.availableValuesSource.split('),(')
      .map(tuple => tuple.replace('(', '').replace(')', ''))

    return tuples.map(tuple => <Picker.Item
      key={tuple.split(',')[0]}
      label={tuple.split(',')[0]}
      value={tuple.split(',')[1]} />)
  }

  renderSendButton = () =>
    this.state.disableSendAction ? undefined
      : <View style={{ margin: 16 }}>
        <Button
          disabled={this.state.disableSendAction}
          title={dictValueOrEmpty(this.state.labelDictionary, 'POST_RATE')}
          onPress={this.postRate}/>
      </View>
}
