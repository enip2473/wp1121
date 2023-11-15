import React, { useState } from 'react';
import { Box, Modal, Button, IconButton, Typography, FormControl, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

type UserSelectModalProps = {
  open: boolean;
  onClose: () => void;
};

const UserSelectModal = ({ open, onClose }: UserSelectModalProps) => {
  const [selectedUser, setSelectedUser] = useState('');
  const router = useRouter();

  const users = ['Alice', 'Bob', 'Charlie', 'Dave'];

  const handleUserSelect = (event: SelectChangeEvent<string>) => {
    setSelectedUser(event.target.value);
  };

  const handleCreate = () => {
    onClose();
    router.refresh();
  };


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
            {users.map((user) => (
              <MenuItem key={user} value={user}>
                {user}
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
