import { useState } from 'react';
import axiosInstance from './AxiosConfig'
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";

interface AddPlaylistProps {
    open: boolean;
    onClose: () => void;
}

export default function AddPlaylistDialog({ open, onClose }: AddPlaylistProps) {
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');

    const handleSave = async () => {
        if (playlistName && playlistDescription) {
            try {
                const response = await axiosInstance.post('/lists', { name: playlistName, description: playlistDescription });
                if (response.status === 201) {
                    onClose();
                    setPlaylistName('');
                    setPlaylistDescription('');
                    window.location.reload();
                }
            } catch (error) {
                alert('A list with same name already exists!');
            }
        } else {
            alert('Playlist name and escription cannot be empty!');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add a new playlist</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Playlist Name"
                    type="text"
                    fullWidth
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Playlist Description"
                    type="text"
                    fullWidth
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
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
