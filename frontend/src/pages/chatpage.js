import React, { useState, useRef, useEffect } from 'react';


const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, type: 'user' }]);
      setInput('');
      setIsTyping(true);

      // Simulate bot response
      setTimeout(() => {
        setMessages([...messages, { text: input, type: 'user' }, { text: 'Bot response here...', type: 'bot' }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    
    <div className="home">
    <h2 className='head'>C5i ChatAi</h2>
    <div className="chat-wrapper"> 
      <div className="history-container">
        <div className="history-header">Chat History</div>
        <div className="history-box">
          {/* Example static content */}
          <div className="history-message">Previous chat messages will appear here.</div>
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}-message`}>
              {msg.text}
            </div>
          ))}
          {isTyping && <div className="message bot-message">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="send-button" onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div></div>
  );
};

export default ChatPage;
