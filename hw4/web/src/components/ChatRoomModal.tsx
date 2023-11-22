import React, { useState } from 'react';
import { Box, Modal, Button, IconButton, Typography, FormControl, MenuItem } from '@mui/material';
import Select, {type SelectChangeEvent } from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import type { UserSelectModalProps } from '@/lib/types';
import { Endpoints } from '@/lib/endpoints'
import axios from 'axios';

function UserSelectModal ({ users, userId, open, onClose }: UserSelectModalProps) {
  const [selectedUser, setSelectedUser] = useState<number | undefined>();
  const router = useRouter();

  const handleUserSelect = (event: SelectChangeEvent<number>) => {
    setSelectedUser(event.target.value as number);
  };

  const handleCreate = async () => {
    if (selectedUser) {
      const postRequest = {
        chatroomName: "tmp",
        userIds: [selectedUser, userId]
      }
      const response = await axios.post(
        `${Endpoints.createChatRoom}${userId}`,
        postRequest
      )
      const exist = response.data.exist;
      if (exist) alert("A chatroom with these members already exists.");
      const createdRoomId = response.data.chatroomId;
      router.push(`/?id=${userId}&chat=${createdRoomId}`);
    }

    setSelectedUser(1);
    onClose();
  };

  const filteredUsers = users.filter((user) => user.id != userId);

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-10 py-8 shadow-lg rounded-lg">
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="absolute top-0 right-0 m-1"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2">Start a chat with</Typography>
        <FormControl fullWidth margin="normal">
          <Select
            autoFocus
            value={selectedUser}
            onChange={handleUserSelect}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {filteredUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box className="w-full flex justify-end m-2">
            <Button onClick={handleCreate} variant="text" color="primary">
                Create
            </Button>
        </Box>

      </Box>
    </Modal>
  );
};

export default UserSelectModal;
