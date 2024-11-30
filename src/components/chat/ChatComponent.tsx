import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useUser } from "@clerk/nextjs";

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<{ userId: string; message: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channel = pusher.subscribe('chat-channel');
    channel.bind('new-message', (data: { userId: string; message: string }) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      pusher.unsubscribe('chat-channel');
    };
  }, []);

  const sendMessage = async () => {
    if (!user) return; // Don't send if user is not authenticated
    
    await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage, userId: user.firstName }),
    });
    setNewMessage('');
  };

  return (
    <div className="chat-component">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.userId}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
