import React, { Component } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import backendConnector from '../../connectors/BackendConnector'
import * as _ from 'lodash'
import { Styles } from '../Styles'
import { commonActivityIndicator, dictValueOrEmpty } from '../../utils/CommonUtils'
import { Button, Icon, ListItem } from 'react-native-elements'
import { ImagePicker } from 'expo'
import { getImageByS3Url, uploadProofMedia } from '../../connectors/S3Connector'
import { CustomPicker } from 'react-native-custom-picker'

export default class ReportSideMissionScreen extends Component {
  constructor() {
    super()
    this.state = {
      missionType: {},
      labelDictionary: undefined,
      missionDictionary: undefined,
      proofExampleImages: undefined,
      teammates: undefined,
      performingUserId: undefined,
      isLoading: true,
      pickedFiles: [],
      disableSendAction: true,
    }
  }

  async componentDidMount() {
    this.setState({ missionType: await this.props.navigation.getParam('missionType') })

    const loadTeammates = backendConnector.getTeammates().then(teammates =>
      this.setState({ teammates: teammates }))

    const loadScreenLabels = backendConnector.getDictionary('REPORT_SM_SCREEN_LABELS')
      .then(dict => this.setState({ labelDictionary: dict }))

    const loadMissionDict = backendConnector.getDictionary(this.state.missionType.dictionaryName)
      .then(dict => this.setState({ missionDictionary: dict }))

    const proofExampleImages
      = this.state.missionType.proofRequirements.map(proof => getImageByS3Url(proof.exampleUrl))

    const loadProofImages = Promise.all(proofExampleImages)
      .then(proofs => this.setState({ proofExampleImages: proofs }))

    Promise.all([loadTeammates, loadScreenLabels, loadMissionDict, loadProofImages])
      .then(() => this.setState({ isLoading: false }))
  }

  addFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'All',
      allowsEditing: true,
      quality: 0.2,
    })
    console.log(result)

    if (!result.cancelled) {
      await this.setState({ pickedFiles: this.state.pickedFiles.concat([result]) })
      await this.resolveSendActionAvailability()
    }
  }

  deselectFile = async (uri) => {
    console.log('deselect file: ' + uri)
    const files = this.state.pickedFiles
    _.remove(files, { uri: uri })
    this.setState({ pickedFiles: files })
  }

  resolveSendActionAvailability = async () => {
    if (this.state.performingUserId) {
      let requiredProofTypes = [...this.state.missionType.proofRequirements]

      const leftMediaTypes = this.state.pickedFiles.filter(file => {
        const match = _.find(requiredProofTypes, { type: fileTypeToKey(file) })
        if (match) {
          requiredProofTypes = _.without(requiredProofTypes, match)
          return true
        }
        return false
      }).length

      const requiredAnyMediaCount = requiredProofTypes.filter(type => type === 'PHOTO_OR_VIDEO').length

      const notMatchedRequiredSpecificMediaTypes = requiredProofTypes.length - requiredAnyMediaCount

      const disableSendAction = leftMediaTypes < requiredAnyMediaCount || notMatchedRequiredSpecificMediaTypes > 0

      this.setState({ disableSendAction: disableSendAction })
    }
  }

  sendReport = async () => {
    await uploadProofMedia(this.state.pickedFiles)
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[Styles.scrollView, { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16 }]}>
          <View style={{ alignSelf: 'stretch', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={Styles.title}>
              {this.state.missionType.displayName}
            </Text>
            {this.state.isLoading ? commonActivityIndicator(8) : null}
          </View>
          <Text style={[Styles.label, { marginTop: 24 }]}>
            {dictValueOrEmpty(this.state.labelDictionary, 'PERFORMING_USER')}
          </Text>
          <View style={{ alignSelf: 'stretch', width: '100%' }}>
            {this.renderPerformerPicker()}
          </View>
          <Text style={[Styles.label, { marginTop: 24 }]}>
            {dictValueOrEmpty(this.state.labelDictionary, 'REQUIRED_PROOFS')}
          </Text>
          <Text style={Styles.subLabel}>
            {dictValueOrEmpty(this.state.labelDictionary, 'MIN_FILE_SET')}
          </Text>
          {this.renderProofsSpecification()}
          <View style={{ alignSelf: 'stretch', width: '100%', paddingVertical: 16 }}>
            {this.renderPickedFiles()}
          </View>
          {this.renderButtons()}
        </ScrollView>
      </View>
    )
  }

  renderPerformerPicker = () => !this.state.teammates ?
    null
    : <CustomPicker
      placeholder={dictValueOrEmpty(this.state.labelDictionary, 'PERFORMING_USER')}
      options={this.state.teammates}
      getLabel={item => item.username}
      onValueChange={item => this.setState({ performingUserId: item ? item.userId : undefined })}
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

  renderProofsSpecification = () => {
    if (!this.state.missionType.proofRequirements) {
      return null
    }
    return this.state.missionType.proofRequirements.map(proofReq => {
      const exampleImage = _.find(this.state.proofExampleImages, ['url', proofReq.exampleUrl])
      return (
        <View key={proofReq.exampleUrl}
          style={{ alignSelf: 'stretch', width: '100%', paddingLeft: 20, paddingRight: 10 }}>
          <Text style={[Styles.midLabel, { marginTop: 12 }]}>
            {dictValueOrEmpty(this.state.labelDictionary, proofReq.type)}
          </Text>
          <Text style={Styles.subLabel}>
            {dictValueOrEmpty(this.state.missionDictionary, proofReq.hint)}
          </Text>
          {!exampleImage ? null
            : <Image source={{ uri: exampleImage.base64Url }} style={{ width: '100%', aspectRatio: 1 }}/>}
        </View>
      )
    })
  }

  renderButtons = () =>
    this.state.isLoading ? null
      : <View style={{ alignSelf: 'stretch', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          title={dictValueOrEmpty(this.state.labelDictionary, 'ADD_FILE')}
          onPress={this.addFile}/>
        <Button
          disabled={this.state.disableSendAction}
          title={dictValueOrEmpty(this.state.labelDictionary, 'SEND_REPORT')}
          onPress={this.sendReport}/>
      </View>

  renderPickedFiles = () => this.state.pickedFiles.map(file => (
    <View key={file.uri}
      style={{ alignSelf: 'stretch', width: '100%', height: 64, flexDirection: 'row', alignItems: 'center' }}>
      <Icon name='cross' type='entypo' color='red' size={48} onPress={() => this.deselectFile(file.uri)}/>
      <Image source={{ uri: file.uri }} style={{ height: '90%', aspectRatio: 1, marginLeft: 16 }}/>
      <Text style={[Styles.midLabel, { marginLeft: 16 }]}>
        {dictValueOrEmpty(this.state.labelDictionary, fileTypeToKey(file))}
      </Text>
    </View>
  ))
}

const fileTypeToKey = (file) => file.type === 'video' ? 'VIDEO' : 'PHOTO'
