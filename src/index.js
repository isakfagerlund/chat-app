import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ChatContainer from './ChatContainer';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<ChatContainer />, document.getElementById('root'));
registerServiceWorker();
