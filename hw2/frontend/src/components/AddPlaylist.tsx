import { useState } from 'react';
import axiosInstance from './AxiosConfig'
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@mui/material";

interface AddPlaylistProps {
    open: boolean;
    onClose: () => void;
}


export default function AddPlaylistDialog({ open, onClose }: AddPlaylistProps) {
    const [playlistTitle, setPlaylistTitle] = useState('');

    const handleSave = async () => {
        if (playlistTitle) {
            try {
                const response = await axiosInstance.post('/lists', { name: playlistTitle });

                if (response.status === 200 || response.status === 201) {
                    // Close the dialog and reset the playlist title
                    onClose();
                    setPlaylistTitle('');
                    window.location.reload();
                } else {
                    console.error('Failed to save the playlist.');
                }
            } catch (error) {
                console.error('There was an error saving the playlist:', error);
            }
        } else {
            alert('Playlist title cannot be empty!');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add a new playlist</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter the title for your new playlist.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Playlist Title"
                    type="text"
                    fullWidth
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
