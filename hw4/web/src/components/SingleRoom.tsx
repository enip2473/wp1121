// components/MessageBar.js
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Box, Typography, InputBase } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Message, MousePosition, SingleRoomProps } from '@/lib/types';
import { useMessages } from '@/hooks/useMessages';
import { Endpoints } from '@/lib/endpoints';
import axios from 'axios';
import { formatUsers } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import SingleMessage from '@/components/SingleMessage';
import CampaignIcon from '@mui/icons-material/Campaign';
import { User } from '@/lib/types';

function ReadUsers({users}: {users: User[]}) {
  if (users.length === 0) {
    return <></>
  }
  return (
    <Box className="flex justify-end mb-2">
      {users.map(user => <Avatar className="w-[15px] h-[15px]"/>)}
    </Box>
  )
}

export default function SingleRoom({ refetchChatRoom }: SingleRoomProps) {
  const { userId, chatId, users, messages, pinnedMessage, refetch } = useMessages();

  const usersExcept = users.filter(user => user.id != userId);
  const readStatus: User[][] = Array.from({ length: messages.length + 1 }, () => []);

  usersExcept.forEach(user => {
    let lastIndex = 0;
    const userRead = new Date(user.lastRead);
    messages.forEach(message => {
      const createdAt = new Date(message.createdAt);
      if (userRead.getTime() >= createdAt.getTime()) {
        lastIndex += 1;
      }
    });
    readStatus[lastIndex].push(user);
  })

  const updatedMessages = messages.map((message, index) => ({
    ...message,
    readUsers: readStatus[index + 1]
  }))

  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage) return;
    const postMessage = {
      content: newMessage,
      userId
    }
    setNewMessage('');
    await axios.post(`${Endpoints.createMessages}${chatId}`, postMessage);
    refetch();
    refetchChatRoom();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete?")) {
      await axios.delete(`${Endpoints.deleteChatRoom}${chatId}`);
      refetch();
      refetchChatRoom();
      router.push(`/?id=${userId}`);
      console.log("Deleted!");
    }
    else {
      console.log("Canceled!");
    }
  }


  const [myMenu, setMyMenu] = useState<MousePosition | null>(null);
  const [othersMenu, setOthersMenu] = useState<MousePosition | null>(null);
  const [contextMessageId, setContextMessageId] = useState<number | null>(null);

  const handleContextMenu = (event: React.MouseEvent, message: Message) => {
    event.preventDefault();
    setContextMessageId(message.id);
    if (message.userId === userId) {
      setMyMenu(
        myMenu === null
          ? { mouseX: event.clientX - 10, mouseY: event.clientY - 4 }
          : null,
      );
      setOthersMenu(null);
    }
    else {
      setOthersMenu(
        othersMenu === null
        ? { mouseX: event.clientX - 10, mouseY: event.clientY - 4 }
        : null,
      )
      setMyMenu(null);
    }
  };

  const handleCloseContextMenu = () => {
    setOthersMenu(null);
    setMyMenu(null);
    setContextMessageId(null);
  };
  
  const handleAnnounce = async () => {
    console.log("Announce message", contextMessageId);
    const putRequest = {
      pinnedMessageId: contextMessageId
    }
    await axios.put(`${Endpoints.modifyChatRoom}${chatId}`, putRequest);
    refetch();
    handleCloseContextMenu();
  };

  const handleRemoveForMe = async () => {
    console.log("Remove message for me", contextMessageId);
    const putRequest = {
      isPinned: false,
      isHidden: true,
    }
    await axios.put(`${Endpoints.modifyMessages}${contextMessageId}`, putRequest);
    refetch();
    refetchChatRoom();
    handleCloseContextMenu();
  };

  const handleRemoveForEveryone = async () => {
    console.log("Remove message for everyone", contextMessageId);
    const putRequest = {
      content: "deleted",
      isSystem: true,
      isPinned: false,
      isDeleted: true,
    }
    await axios.put(`${Endpoints.modifyMessages}${contextMessageId}`, putRequest);
    refetch();
    refetchChatRoom();
    handleCloseContextMenu();
  };

  if (chatId < 0) {
    return (
      <Box className="flex flex-col h-full w-full"></Box>
    )
  }


  return (
    <Box className="flex flex-col h-full w-full">
      <Box className="p-4 flex items-center border-b">
        <Avatar />
        <Box className="ml-4 flex-1">
          <h3 className="text-lg font-semibold">{formatUsers(users, userId)}</h3>
        </Box>
        <IconButton onClick={() => handleDelete()}>
          <DeleteIcon />
        </IconButton>
      </Box>
      {pinnedMessage && !pinnedMessage.isDeleted && !(pinnedMessage.isHidden && pinnedMessage.userId === userId) && (
        <Box className="w-full justify-center flex">
        <Box className="w-4/5 m-2 flex justify-center rounded-xl bg-gray-100">
          <CampaignIcon className="mt-1 mr-1"/>
          <Typography variant="h6">
            {pinnedMessage.content}
          </Typography>
        </Box>
        </Box>
      )}
      <Box className="flex-1 overflow-auto p-4">
        {updatedMessages.map((message) => 
          <>
            <SingleMessage 
              userId={userId} 
              users={users} 
              message={message} 
              handleContextMenu={handleContextMenu}
            />
            <ReadUsers users={message.readUsers}/>
          </>
        )}
        <Menu
          open={myMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            myMenu !== null
              ? { top: myMenu.mouseY, left: myMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleAnnounce}>Announce</MenuItem>
          <MenuItem onClick={handleRemoveForMe}>Remove For Me</MenuItem>
          <MenuItem onClick={handleRemoveForEveryone}>Remove For Everyone</MenuItem>
        </Menu>

        <Menu
          open={othersMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            othersMenu !== null
              ? { top: othersMenu.mouseY, left: othersMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleAnnounce}>Announce</MenuItem>
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
        <IconButton onClick={() => handleSendMessage()} aria-label="send" color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}


