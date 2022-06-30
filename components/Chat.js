import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

// import Firestore
const firebase = require('firebase');
require('firebase/firestore');

// firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBC1A4BqY33yrrJJJZih0qqaEiWKwmhtnE',
  authDomain: 'chat-app-a2df5.firebaseapp.com',
  projectId: 'chat-app-a2df5',
  storageBucket: 'chat-app-a2df5.appspot.com',
  messagingSenderId: '673132572804',
  appId: '1:673132572804:web:55e73d867aae88c3d3d2d1',
};

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      loggedInText: 'You are offline.',
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
      image: null,
      location: null,
    };

    //connect to Firestore
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    //create reference to the messages collection in the database:
    this.referenceChatMessages = firebase.firestore().collection('messages');
  }

  componentDidMount() {
    console.log(this.state.messages);
    // get name prop from user input on start screen
    const { name } = this.props.route.params;
    // set the title of the chat screen to user's name
    this.props.navigation.setOptions({
      title: `${name}'s ChatWorld`,
    });

    // load messages from asyncStorage
    this.getUser();
    this.getMessages();

    // Find out if user is online or offline and tell app what to do when online/offline.
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log('online');

        // Check if user is signed in. If not, create a new user.
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              loggedInText: 'You are online. Ready to chat!',
              messages: [],
              user: {
                _id: user.uid,
                name: name,
                avatar: 'https://placeimg.com/140/140/any',
              },
            });

            this.unsubscribeMessages = this.referenceChatMessages
              .orderBy('createdAt', 'desc')
              .onSnapshot(this.onCollectionUpdate);
            this.saveMessagesOffline();
            this.saveUserOffline();
          });
      } else {
        this.setState({ isConnected: false });
        this.props.navigation.setOptions({ title: `${name} is Offline` });
      }
    });
  }

  //function to save messages in the asyncStorage
  async saveMessagesOffline() {
    try {
      await AsyncStorage.setItem(
        'messages',
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }
  //function to save user in the asyncStorage
  async saveUserOffline() {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(this.state.user));
    } catch (error) {
      console.log(error.message);
    }
  }

  //function to get messages from asyncStorage
  async getMessages() {
    let messages = '';
    try {
      /*Read messages in storage. 
        If there is no storage item with that key, messages are set to be empty*/
      messages = (await AsyncStorage.getItem('messages')) || [];
      //give messages the saved data
      this.setState({
        /* asyncStorage can only store strings. 
          This converts the saved string back into a JSON object*/
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  //function to get user from AsyncStorage
  async getUser() {
    let user = '';
    try {
      user = (await AsyncStorage.getItem('user')) || '';
      this.setState({
        user: JSON.parse(user),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  //Delete stored messages. To get rid of test messages during development.
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  componentWillUnmount() {
    //stop listening for changes
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.unsubscribeMessages();
        this.authUnsubscribe();
      }
    });
  }

  // Add new messages to the firebase messages collection
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      //user: this.state.user,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  }

  /* The message a user has just sent gets appended to the state messages 
  so that it can be displayed in the chat. */
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessages();
        this.saveMessagesOffline();
      }
    );
  }

  // allows user to see new messages when database updates
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages,
    });

    this.saveMessagesOffline();
    this.saveUserOffline();
  };

  // Customize color of the sender's chat bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: 'black',
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: 'pink',
          },
        }}
      />
    );
  }
  // Render InputToolbar to send messages only when user is online.
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
      // hide InputToolbar
    } else {
      return <InputToolbar {...props} />;
    }
  }

  // creates button in the text input field
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };
  // render user's location
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  // render components
  render() {
    //background color chosen in Start screen is set as const background
    const { name, chatColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: chatColor,
        }}
      >
        <Text style={{ color: 'white' }}>{this.state.loggedInText}</Text>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            name: name,
            avatar: this.state.user.avatar,
          }}
          showAvatarForEveryMessage={true}
          renderUsernameOnMessage={true}
        />
        {/* Prevent keyboard from overlapping text messages on some Android versions */}
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
