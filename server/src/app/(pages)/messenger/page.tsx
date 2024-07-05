// src/app/(pages)/messenger/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function Messenger() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, userId: user.id }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 text-2xl font-bold">Messenger</h1>
      <div className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
        <div className="mb-4 h-64 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <strong>{message.user.name}:</strong> {message.content}
            </div>
          ))}
        </div>
        <div className="flex">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="mr-2 flex-grow"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
