import React, { Component } from 'react'
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, Text, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import backendConnector from '../../connectors/BackendConnector'
import * as constant from '../constants'
import moment from 'moment'
import { Styles } from '../Styles'

export default class TeamPointsListScreen extends Component {
  constructor() {
    super()
    this.teamId = ''
    this.teamColor = 'black'
    this.teamImageUri = undefined
    this.state = {
      score: '',
      isLoading: true,
      isRefreshing: false,
      points: [],
      page: 0,
      moreItemsAvailable: true,
    }
  }

  async componentDidMount() {
    this.teamImageUri = this.props.navigation.getParam('teamImageUri')
    const score = this.props.navigation.getParam('score')

    this.teamId = score.team.teamId
    this.teamColor = score.team.color
    this.setState({ score: score.score })

    await this.loadMoreItems().then(() => this.setState({ isLoading: false }))
  }

  loadMoreItems = async () => {
    await backendConnector.getTeamPoints(this.teamId, this.state.page)
      .then(res => this.setState({
        points: this.state.points.concat(res.content),
        page: this.state.page + 1,
        moreItemsAvailable: !res.last,
      }))
      .then(() => console.log('loaded points count: ' + this.state.points.length))
  }

  async onRefresh() {
    await this.setState({ isRefreshing: true, points: [], page: 0, moreItemsAvailable: true })
    await this.loadMoreItems().then(() => this.setState({ isRefreshing: false }))
  }

  async onEndReached() {
    if (this.state.moreItemsAvailable && !this.state.isRefreshing) {
      await this.loadMoreItems()
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={Styles.scrollView}>
          <View style={Styles.scoreBoard}>
            <Image source={{ uri: this.teamImageUri }} style={{ width: 128, aspectRatio: 1 }}/>
            <Text style={{ color: this.teamColor, fontWeight: 'bold', fontSize: 64 }}>
              {this.state.score}
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'column' }}>
            {this.renderPoints()}
          </View>
        </ScrollView>
      </View>
    )
  }

  renderPoints = () => {
    if (this.state.isLoading) {
      return <ActivityIndicator size={'large'} color={constant.mainColor} style={{ alignSelf: 'stretch', margin: 48 }}/>
    }
    return (
      <FlatList
        data={this.state.points}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.onRefresh.bind(this)}
          />
        }
        renderItem={this.renderPointsItem}
        keyExtractor={(item) => item.pointsId.toString()}
        onEndReachedThreshold={0.4}
        onEndReached={this.onEndReached.bind(this)}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    )
  }

  renderPointsItem = ({ item }) => {
    return (
      <ListItem
        style={{ alignSelf: 'stretch', height: 64 }}
        leftAvatar={item.user ? { source: { uri: item.user.imageUrl } } : undefined}
        title={item.user ? item.user.username : item.shortLabel}
        subtitle={moment(Date.parse(item.timestamp.split('.')[0])).format('HH:mm / DD.MM.YY')}

        rightTitle={item.amount.toString()}
        rightTitleStyle={{ color: this.teamColor, fontWeight: 'bold', fontSize: 32 }}
        rightSubtitle={constant.pointsTypeSymbol[item.pointsId.type]}
        rightSubtitleStyle={{ color: 'purple', fontWeight: 'bold', fontSize: 16 }}
        rightIcon={{ name: 'arrow-right', type: 'font-awesome', style: { marginRight: 10, fontSize: 15 } }}
      />
    )
  }
}
