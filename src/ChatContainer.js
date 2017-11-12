import React, { Component } from 'react';
import './ChatContainer.css';
import openSocket from 'socket.io-client';
import Message from './Message';
const socket = openSocket('https://chat-app-1337-server.herokuapp.com/:14665');

class ChatContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      input: '',
      loggedIn: false,
      user: '',
      usersOnline: [],
      connected: false,
      loaded: false,
      notification: "nothing"
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.logIn = this.logIn.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.handleUserEvent = this.handleUserEvent.bind(this);
    this.showNotification = this.showNotification.bind(this);
  } 

  componentDidMount(){
    this.handleMessageEvent();
    this.handleUserEvent();
    this.setState({ loaded: true});
    // const cachedMessages = localStorage.getItem("messages");
    // if (cachedMessages) {
    //   this.setState({ messages: JSON.parse(cachedMessages) });
    //   return;
    // }
  }

  componentDidUpdate(){
    // localStorage.setItem("messages", JSON.stringify(this.state.messages));
    if (this.state.loaded && this.state.loggedIn) {
      var obj = document.getElementById("chat-container");
      obj.scrollTop = obj.scrollHeight;
    }
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

    socket.on('login', (data) => {
      this.setState({usersOnline: data.usersOnline})
      this.setState({connected:true});
    })

    socket.on('disconnect', () => {
      this.setState({connected:false});
    });

    socket.on('user joined', (data) => {
      this.setState({usersOnline: data.usersOnline});
      if (this.state.loggedIn) {
        this.setState({notification:`${data.username} Joined the chat`});
        this.showNotification(data.username);
      }   
    });

    socket.on('user left', (data) => {
      this.setState({usersOnline: data.usersOnline});
      if (this.state.loggedIn) {
        this.setState({notification:`${data.username} Left the chat`});
        this.showNotification(data.username);
      } 
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

  showNotification(data) {
    console.log("show");
    // document.getElementById("notifications").style.display="block";
    // setTimeout(function(){
    //   document.getElementById("notifications").style.display="none";
    // },5000)
  }

  logIn(event) {
    if (this.state.user.length > 0) {
      socket.emit('add user', this.state.user);
      var usersArray = this.state.usersOnline;
      usersArray.push(this.state.user);
      this.setState({ usersOnline: usersArray });
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
          <div id="notifications">
            <p>{this.state.notification}</p>
          </div>
          <div className="chat-container" id="chat-container">
            <ul id="messages">{this.state.messages.map((message, id) => {
              return (
                <Message key={id} user={message.user} message={message.message} theId={message.user === this.state.user ? "yourMessage" : "otherMessage"}/>
              )
            })}
            </ul>
          </div>
          <div className="users-online">
            <span>Users online: </span>
            {this.state.usersOnline.map((item, id) => {
              return (
                <p key={id}>{item}</p>
              )
            })}
          </div>
          <form onSubmit={this.sendMessage}>  
            <textarea id="message" placeholder="Write message here..." autoComplete="off" value={this.state.input} onChange={this.handleChange} required/><button>Send</button>
          </form>     
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
