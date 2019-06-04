import React, { Component } from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import backendConnector from '../../../connectors/BackendConnector'
import { getThumbnail } from '../../../connectors/S3Connector'
import { Styles } from '../../Styles'
import { commonActivityIndicator } from '../../../utils/CommonUtils'

export default class RateReportScreen extends Component {
  constructor() {
    super()
    this.report = undefined
    this.missionTypeLabel = undefined
    this.state = {
      proofs: undefined,
      loadingThumbnails: true,
      proofThumbnails: [],
      missionType: undefined,
      missionSpecificLabels: [],
    }
  }

  async componentDidMount() {
    this.report = await this.props.navigation.getParam('report')
    this.missionTypeLabel = await this.props.navigation.getParam('typeLabel')

    const getProofMedia = backendConnector.getReportProofs(this.report.reportId)
      .then(proofs => this.setState({ proofs: proofs }))
      .then(() => Promise.all(this.state.proofs.map(proof => getThumbnail(proof.awsS3Url))))
      .then(thumbs => this.setState({
        proofThumbnails: thumbs,
        loadingThumbnails: false,
      }))

    await Promise.all([getProofMedia])
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ ...Styles.scrollView, paddingTop: 24 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
            contentContainerStyle={Styles.horizontalScrollView}>
            {this.renderProofs()}
          </ScrollView>
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
}
