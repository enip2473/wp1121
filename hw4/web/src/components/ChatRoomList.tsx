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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Box from '@mui/material/Box';
import ChatRoomModal from '@/components/ChatRoomModal';
import { Button, Typography } from '@mui/material';
import { ChatRoomListProps } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatUsers } from '@/lib/utils';

export default function ChatRoomList({userId, chatId, users, chatRooms, refetch}: ChatRoomListProps) {
  const router = useRouter();
  if (userId > 0 && chatId < 0 && chatRooms.length > 0) {
    router.replace(`/?id=${userId}&chat=${chatRooms[0].chatroomId}`);
  }

  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = () => {
    refetch();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const filteredChatRooms = chatRooms.filter(chatRoom => 
    formatUsers(chatRoom.users, userId).toLowerCase().includes(searchTerm.toLowerCase())
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
        <ChatRoomModal users={users} userId={userId} open={openModal} onClose={handleCloseModal} />
      </Box>
      <Box className="flex-1 overflow-auto p-4 flex w-full max-h-[80vh] justify-center">
        {filteredChatRooms.length > 0 ? (
          <List className="w-full">
            {filteredChatRooms.map((chatRoom, index) => (
              <Link href={{
                pathname: '/',
                query: { id: userId, chat: chatRoom.chatroomId },
              }}>
                <ListItem key={index} className={`border-b border-gray-300 rounded m-2 ${chatRoom.chatroomId === chatId ? 'bg-gray-200' : ''}`}>
                  <ListItemAvatar>
                    <Avatar alt={chatRoom.chatroomName} />
                  </ListItemAvatar>
                  <ListItemText primary={formatUsers(chatRoom.users, userId)} secondary={chatRoom.lastMessageContent} />
                </ListItem>
              </Link>
            ))}
          </List>
        ) : (
          <Button onClick={handleOpenModal}>
            <Typography>
              Can't find your friend?
            </Typography>
          </Button>
        )}
      </Box>
    </div>
  );
}
