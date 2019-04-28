import React, { Component } from 'react'
import { ActivityIndicator, View } from 'react-native'
import * as constant from './constants'
import backendConnector from '../connectors/BackendConnector'

class MainScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      privileges: [],
    }
  }

  async componentDidMount() {
    this.setState({ privileges: await backendConnector.getMyPrivileges() })
    this.setState({ isLoading: false })
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {this.renderOptions()}
      </View>
    )
  }

  renderOptions() {
    if (this.state.isLoading) {
      return <ActivityIndicator size={'large'} color={constant.mainColor}/>
    }
    return null
  }
}

export default MainScreen
