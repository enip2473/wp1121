"use client";

import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Box from '@mui/material/Box';
import ChatRoomModal from '@/components/ChatRoomModal'

export default function ChatRoomList() {
  const chatRooms = [
    { name: 'Lilly Jr.', message: 'Good idea! I like this.', avatar: '/path-to-lilly-avatar.jpg' },
    { name: 'Bob', message: 'Great. Thanks!', avatar: '/path-to-bob-avatar.jpg' },
  ];

  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const filteredChatRooms = chatRooms.filter(chatRoom =>
    chatRoom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-full items-start m-2">
      <Box className="w-full flex justify-center">
        <Paper className="flex items-center p-2">
            <InputBase
                className="ml-1 flex-grow"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <IconButton onClick={handleOpenModal}>
                <AddCircleOutlineIcon />
            </IconButton>
        </Paper>
        <ChatRoomModal open={openModal} onClose={handleCloseModal} />
      </Box>
      <List className="overflow-auto w-full">
        {filteredChatRooms.map((chatRoom, index) => (
          <ListItem key={index} className="border-b border-gray-300">
            <ListItemAvatar>
              <Avatar alt={chatRoom.name} src={chatRoom.avatar} />
            </ListItemAvatar>
            <ListItemText primary={chatRoom.name} secondary={chatRoom.message} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
