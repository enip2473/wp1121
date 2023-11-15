// components/MessageBar.js
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Box, Paper, InputBase } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MousePosition } from '@/db/types';

export default function SingleRoom() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, Mrs. Lilly', sender: 'other' },
    { id: 2, text: 'Hello, Mrs. Lilly, I have a good idea...', sender: 'user' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!newMessage) return;
    const nextId = messages.length + 1;
    setMessages([...messages, { id: nextId, text: newMessage, sender: 'user' }]);
    setNewMessage('');
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete?")) {
      console.log("Deleted!");
    }
    else {
      console.log("Canceled!");
    }
  }

  const [contextMenu, setContextMenu] = useState<MousePosition | null>(null);
  const [contextMessageId, setContextMessageId] = useState<number | null>(null);

  const handleContextMenu = (event: React.MouseEvent, messageId: number) => {
    event.preventDefault();
    setContextMessageId(messageId);
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMessageId(null);
  };


  
  const handleAnnounce = () => {
    console.log("Announce message", contextMessageId);
    handleCloseContextMenu();
  };

  const handleRemoveForMe = () => {
    console.log("Remove message for me", contextMessageId);
    handleCloseContextMenu();
  };

  const handleRemoveForEveryone = () => {
    console.log("Remove message for everyone", contextMessageId);
    handleCloseContextMenu();
  };


  return (
    <Box className="flex flex-col h-full w-full">
      <Box className="p-4 flex items-center border-b">
        <Avatar src="/path-to-conversation-avatar.jpg" />
        <Box className="ml-4 flex-1">
          <h3 className="text-lg font-semibold">Lilly Jr.</h3>
        </Box>
        <IconButton onClick={() => handleDelete()}>
          <DeleteIcon />
        </IconButton>
      </Box>
      <Box className="flex-1 overflow-auto p-4">
        {messages.map((message) =>
          message.sender === 'user' ? (
            <Box 
              key={message.id} 
              className="flex justify-end mb-4" 
              onContextMenu={(e) => handleContextMenu(e, message.id)}
            >
              <Paper className="p-2">
                <p>{message.text}</p>
              </Paper>
            </Box>
          ) : (
            <Box 
              key={message.id} 
              className="flex items-center mb-4"
              onContextMenu={(e) => handleContextMenu(e, message.id)}

            >
              <Avatar src="/path-to-sender-avatar.jpg" />
              <Box className="ml-2">
                <Paper className="p-2">
                  <p>{message.text}</p>
                </Paper>
              </Box>
            </Box>
          )
        )}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleAnnounce}>Announce</MenuItem>
          <MenuItem onClick={handleRemoveForMe}>Remove for me</MenuItem>
          <MenuItem onClick={handleRemoveForEveryone}>Remove for everyone</MenuItem>
        </Menu>
        <div ref={messagesEndRef} />
      </Box>
      <Box className="flex p-4 border-t">
        <InputBase
          className="flex-1"
          placeholder="Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton type="submit" aria-label="send" color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
