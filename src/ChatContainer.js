import React, { Component } from 'react';
import './ChatContainer.css';
import openSocket from 'socket.io-client';
import Message from './Message';
const socket = openSocket('http://192.168.178.20:7777');

class ChatContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      input: '',
      loggedIn: false,
      user: '',
      connected: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.logIn = this.logIn.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.handleUserEvent = this.handleUserEvent.bind(this);
  } 

  componentDidMount(){
    this.handleMessageEvent();
    this.handleUserEvent();
    const cachedMessages = localStorage.getItem("messages");
    if (cachedMessages) {
      this.setState({ messages: JSON.parse(cachedMessages) });
      return;
    }
  }

  componentDidUpdate(){
    localStorage.setItem("messages", JSON.stringify(this.state.messages));
  }

  addMessage(msg){
    this.setState({messages: this.state.messages.concat(msg)});
  }

  handleMessageEvent(){   
    socket.on('chat message', (inboundMessage) => {
      this.addMessage(inboundMessage);
    })
  } 

  handleUserEvent(){   
    socket.on('new user', (data) => {
      console.log(data);
    })

    socket.on('login', () => {
      this.setState({connected:true});
    })

    socket.on('disconnect', () => {
      this.setState({connected:false});
    });

    socket.on('user left', (data) => {
      console.log(data);
    })
  } 
  
  handleChange(event) {
    console.log(event.target.id);
    if (event.target.id === "message") {
      this.setState({input:event.target.value});
    }else {
      this.setState({user:event.target.value});
    }
    
  }

  logIn(event) {
    if (this.state.user.length > 0) {
      socket.emit('add user', this.state.user);
      this.setState({ loggedIn: true })
    }
    event.preventDefault();
  }

  sendMessage(event) {
    var theMessage = {message:this.state.input, user:this.state.user }
    if (this.state.input.length > 0) {
      socket.emit('chat message', theMessage);
      this.addMessage(theMessage);
      this.setState({ input: '' })
    }
    event.preventDefault();
  }

  render() {
    if (this.state.loggedIn) {
      return (
        <div className="App">
          <h1>Chat App <span className={`status ${this.state.connected ? 'online' : 'offline' }`}></span></h1>
          <form onSubmit={this.sendMessage}>  
            <textarea id="message" placeholder="Write message here..." autoComplete="off" value={this.state.input} onChange={this.handleChange} required/><button>Send</button>
          </form>
          <ul id="messages">{this.state.messages.map((message, id) => {
            return (
              <Message key={id} user={message.user} message={message.message} theId={message.user === this.state.user ? "yourMessage" : "otherMessage"}/>
            )
          })}
          </ul>
        </div>
      );
    }else {
      return (
        <div className="App">
          <h1>Chat App <span className={`status ${this.state.connected ? 'online' : 'offline' }`}></span></h1>
          <form onSubmit={this.logIn}>  
            <input id="user" placeholder="Username" autoComplete="off" value={this.state.user} onChange={this.handleChange} required/>
            <button>Login</button>
          </form>
        </div>
        
      )
    }
    
  }
}

export default ChatContainer;