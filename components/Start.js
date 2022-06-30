import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  Image,
  View,
  KeyboardAvoidingView,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Background from '../assets/background-image.png';
import Icon from '../assets/person.png';

import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); //Hide warning notifications on expo front-end

export default class Start extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '', chatColor: this.colors.white };
  }

  colors = {
    white: '#FFFFFF',
    black: '#090C08',
    purple: '#474056',
    grey: '#8A95A5',
    green: '#B9C6AE',
  };

  /* to set background color that is passed to chat screen */
  changeChatColor = (newColor) => {
    this.setState({ chatColor: newColor });
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ImageBackground source={Background} style={styles.image}>
          <Text style={styles.title}>ChatWorld</Text>
          <View style={styles.spacer}></View>
          <View style={styles.whiteBox}>
            {/*user name will be passed as prop to chat screen*/}
            <View style={styles.inputBox}>
              <Image source={Icon} style={styles.nameIcon}></Image>
              <TextInput
                style={styles.inputField}
                onChangeText={(name) => this.setState({ name })}
                value={this.state.name}
                placeholder="Your Name"
              ></TextInput>
            </View>
            {/* Allows user to pick a background color for the chat screen */}
            <View style={styles.colorWrapper}>
              <Text style={styles.colorText}>Choose Background Color:</Text>
              <View
                style={styles.circleRow}
                accessible={true}
                accessibilityLabel="menu"
                accessibilityHint="Allows to pick a color scheme for the chat page"
              >
                <TouchableOpacity
                  style={[{ backgroundColor: 'black' }, styles.circle]}
                  onPress={() => this.changeChatColor(this.colors.black)}
                  accessibilityLabel="black"
                  accessibilityHint="choose black background for chat page"
                  accessibilityRole="button"
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[{ backgroundColor: 'purple' }, styles.circle]}
                  onPress={() => this.changeChatColor(this.colors.purple)}
                  accessibilityLabel="purple"
                  accessibilityHint="choose purple background for chat page"
                  accessibilityRole="button"
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[{ backgroundColor: 'grey' }, styles.circle]}
                  onPress={() => this.changeChatColor(this.colors.grey)}
                  accessibilityLabel="grey"
                  accessibilityHint="choose grey background for chat page"
                  accessibilityRole="button"
                ></TouchableOpacity>
                <TouchableOpacity
                  style={[{ backgroundColor: 'green' }, styles.circle]}
                  onPress={() => this.changeChatColor(this.colors.green)}
                  accessibilityLabel="green"
                  accessibilityHint="choose green background for chat page"
                  accessibilityRole="button"
                ></TouchableOpacity>
              </View>
            </View>
            {/* Takes user to chat screen. Name and color are passed to chat screen */}
            <Pressable
              accessible={true}
              accessibilityLabel="Tap me"
              accessibilityHint="Navigates to the chat page"
              accessibilityRole="button"
              onPress={() =>
                this.props.navigation.navigate('Chat', {
                  name: this.state.name,
                  chatColor: this.state.chatColor,
                })
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  image: {
    flex: 1,
    resizeMode: 'cover',
    //alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },

  spacer: {
    flex: 1,
  },

  whiteBox: {
    height: '44%',
    margin: '6%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-evenly',
  },

  inputBox: {
    flexDirection: 'row',
    height: 60,
    //margin: '6%',
    width: '88%',
    //marginTop: '6%',
    //marginBottom: '6%',
    borderColor: '#757083',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  nameIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    alignSelf: 'center',
  },
  inputField: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    //opacity: 0.5,
  },

  colorWrapper: {
    //flex: 1,
    width: '88%',
    justifyContent: 'flex-start',
    //margin: '6%',
  },
  colorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
  },
  circleRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  button: {
    //flex: 1,
    backgroundColor: '#757083',
    width: '88%',
    height: 60,
    // marginTop: '6%',
    //marginBottom: '6%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
