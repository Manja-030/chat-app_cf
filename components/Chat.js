import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

// import Firestore
const firebase = require('firebase');
require('firebase/firestore');

// firebase configuration for chat
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
      loggedInText: 'Just a moment, logging in...',
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
    };

    /*Integrate configuration info into chat.js file 
    to allow app to connect to Firestore.*/

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    //create reference to the messages collection in the database:
    this.referenceChatMessages = firebase.firestore().collection('messages');
    //this.referenceMessagesUser = null;
  }

  componentDidMount() {
    // get name prop from user input on start screen and set page title
    const { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // Check if user is signed in. If not, create a new user.
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there.',
        messages: [],
        user: {
          _id: user.uid,
          name: name,
          avatar: 'https://placeimg.com/140/140/any',
        },
      });

      // create reference to active user's messages
      this.referenceMessagesUser = firebase
        .firestore()
        .collection('messages')
        .where('uid', '==', this.state.uid);
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    //stop listening for changes
    this.unsubscribe();
    this.authUnsubscribe();
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
        user: data.user,
      });
    });
    this.setState({
      messages: messages,
    });
  };

  /* The message a user has just sent gets appended to the state messages 
so that it can be displayed in the chat. */
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
  }

  // Add new messages to the firebase messages collection
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      //uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

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

  // render components
  render() {
    //background color chosen in Start screen is set as const background
    const { chatColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: chatColor,
        }}
      >
        <Text>{this.state.loggedInText}</Text>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
          showAvatarForEveryMessage={true}
        />
        {/* Prevent keyboard from overlapping text messages on some Android versions */}
        {Platform.OS === 'android' ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
