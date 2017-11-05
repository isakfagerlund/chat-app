import React from 'react';

class Message extends React.Component {
  render() {
    const { theId, user, message } = this.props;
    return (
      <div className="chat-message" id={theId}>
          <span>{user}</span>
          <li>
            <p>{message}</p>
          </li>   
      </div>
    )
  }
}

export default Message;