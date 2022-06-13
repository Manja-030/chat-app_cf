import React from 'react';
import { View, Text } from 'react-native';

export default class Chat extends React.Component {
  componentDidMount() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
  }

  render() {
    let background = this.props.route.params.chatColor;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: background,
        }}
      >
        <Text>Welcome to the Chat!</Text>
      </View>
    );
  }
}
