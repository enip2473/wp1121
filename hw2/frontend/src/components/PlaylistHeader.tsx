import { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import axiosInstance from './AxiosConfig'
import { Edit as EditIcon } from '@mui/icons-material';
import type { ReceivedPlaylist } from '@lib/shared_types'

type PlaylistHeaderProps = {
  playlist: ReceivedPlaylist;
  setPlaylist: (playlist: ReceivedPlaylist) => void;
};

const PlaylistHeader = ({ playlist, setPlaylist }: PlaylistHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist.name);
  const [editedDescription, setEditedDescription] = useState(playlist.description);

  const handleEditClick = () => {
    setEditedName(playlist.name);
    setEditedDescription(playlist.description);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setEditedName(playlist.name);
    setEditedDescription(playlist.description);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (!editedName || !editedDescription) {
      alert("Please enter name and description!");
      return;
    }
    const updatedPlaylist = {
      ...playlist,
      name: editedName,
      description: editedDescription,
    };
    try {
      const response = await axiosInstance.put(`/lists/${playlist._id}`, updatedPlaylist);
      setPlaylist(response.data);
      setIsEditing(false);
    } catch (error) {
      alert("Playlist with same name exists!");
      console.error("Failed to update playlist:", error);
    }
  };

  return (
    <Box display="flex" alignItems="center" marginBottom={4}>
      <Box marginRight={3}>
        <img
          src="https://farm3.staticflickr.com/2439/12985065254_3e31ec34c6.jpg"
          alt="Playlist"
          width={200}
          height={200}
        />
      </Box>
      <Box flexGrow={1}>
        {isEditing ? (
          <>
            <TextField
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              margin="dense"
              fullWidth
              label="Playlist Name"
            />
            <TextField
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              margin="dense"
              fullWidth
              multiline
              label="Playlist Description"
            />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button color="primary" onClick={handleSaveClick}>
                Save
              </Button>
              <Button color="secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4">{playlist.name}</Typography>
            <Typography variant="body1">{playlist.description}</Typography>
            <Button 
              startIcon={<EditIcon />} 
              variant="contained" 
              color="primary"
              sx={{
                padding: '8px 16px', 
                '&:hover': {
                  backgroundColor: '#4a90e2', // Darker shade for hover
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
                }
              }}
              onClick={handleEditClick}
            >
              Edit
            </Button>

          </>
        )}
      </Box>
    </Box>
  );
};

export default PlaylistHeader;
