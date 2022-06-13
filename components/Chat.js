import React from 'react';
import { View, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

export default class Chat extends React.Component {
  constructor() {
    super();
  }
  componentDidMount() {
    const { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
  }

  // render components
  render() {
    //background color chosen in Start screen is set as const background
    const { chatColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: chatColor,
        }}
      >
        <Text>Welcome to the Chat!</Text>
      </View>
    );
  }
}
