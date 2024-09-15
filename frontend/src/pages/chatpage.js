import React, { useState, useRef, useEffect } from 'react';


const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const messagesEndRef = useRef(null);

    

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Fetch chat history when component mounts
        const fetchChatHistory = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/chat-history');
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setChatHistory(data);
          } catch (error) {
            console.error('Error fetching chat history:', error);
            
          }
        };
      
        fetchChatHistory();
      }, []);
      
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, { text: input, type: 'user' }]);
            setInput('');
            setIsTyping(true);

            try {
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: input })
                });

                const data = await response.json();
                //const botReply = data.reply;
                const queryResults = data.data ? JSON.stringify(data.data) : null;

                setMessages([...messages, 
                    { text: input, type: 'user' }, 
                    ...(queryResults ? [{ text: `${queryResults}`, type: 'bot' }] : [])
                ]);
            } catch (error) {
                console.error('Error sending message:', error);
                
            } finally {
                setIsTyping(false);
            }
        }
    };

    return (
        <div className="home">
            <h2 className='head'>C5i ChatAi</h2>
            <div className="chat-wrapper"> 
                <div className="history-container">
                    <div className="history-header">Chat History</div>
                    <div className="history-box">
  {chatHistory.map((entry, index) => (
    <div key={index} className="history-message">
      <strong>Customer {entry.CustomerID}:</strong> {entry.UserMessage}
      <br />
      <strong>Bot:</strong> {entry.BotMessage}
    </div>
  ))}
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
            </div>
        </div>
    );
};

export default ChatPage;
