import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem } from '@mui/material';
import axiosInstance from './AxiosConfig'
import type { CreateSong, ReceivedPlaylist } from '@lib/shared_types';
import type { GridRowSelectionModel } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

type Props = {
    listId: string | undefined;
    onNewSong: (song: CreateSong) => void;
    onDelete: () => void;
    selectedRows: GridRowSelectionModel;
}

const PlaylistButton = ({ listId, onNewSong, onDelete, selectedRows }: Props) => {
    const [open, setOpen] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState("");
    const [newSong, setNewSong] = useState({ title: '', author: '', link: '' });
    const [playlists, setPlaylists] = useState<{ id: string, name: string }[]>([]);  // State to hold playlists

    useEffect(() => {
        // Fetch playlists from the backend
        axiosInstance.get('/lists')  // Adjust the endpoint as per your API
            .then(response => {
                const fetchedPlaylists = response.data
                    .filter((playlist: ReceivedPlaylist) => playlist._id !== listId)  // Exclude the playlist with id=listID
                    .map((playlist: ReceivedPlaylist) => ({
                        id: playlist._id,
                        name: playlist.name
                    }));
                setPlaylists(fetchedPlaylists);
            })
            .catch(error => {
                console.error('Error fetching playlists:', error);
            });
    }, [listId]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenExport = () => {
        if (selectedRows.length === 0) {
            alert('Select the songs you want to export!');
            return
        }
        setOpenExport(true);
    };

    const handleCloseExport = () => {
        setOpenExport(false);
    };

    const handleSave = async () => {
        onNewSong(newSong);
        handleClose();
    };

    const handleExport = () => {
        // console.log(selectedRows)
        // console.log('Exporting songs to playlist:', selectedPlaylist);
        // Call your API or implement the actual export logic here
        axiosInstance.put(`/lists/${selectedPlaylist}/songs`, { songIds: selectedRows })
            .then(response => {
                if (!response.data.success) {
                console.error('Error updating list:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Error exporting songs:', error);
            })
            .finally(() => {
                // Close the export dialog regardless of success/failure
                handleCloseExport();
            });

        // Close the export dialog
        handleCloseExport();
    };


    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen}>Add</Button>
            <Button variant="contained" color="secondary" onClick={onDelete}>Delete</Button>
            <Button variant="contained" color="secondary" onClick={handleOpenExport}>Export</Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newSong.title}
                        onChange={e => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <TextField 
                        margin="dense"
                        label="Author"
                        fullWidth
                        value={newSong.author}
                        onChange={e => setNewSong(prev => ({ ...prev, author: e.target.value }))}
                    />
                    <TextField 
                        margin="dense"
                        label="Link"
                        fullWidth
                        value={newSong.link}
                        onChange={e => setNewSong(prev => ({ ...prev, link: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openExport} onClose={handleCloseExport}>
                <DialogTitle>Export Songs</DialogTitle>
                <DialogContent>
                    Select a playlist:
                    <Select
                        value={selectedPlaylist}
                        onChange={e => setSelectedPlaylist(e.target.value)}
                        fullWidth
                    >
                        {playlists.map(playlist => (
                            <MenuItem key={playlist.id} value={playlist.id}>
                                {playlist.name}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseExport} color="primary">Cancel</Button>
                    <Button onClick={handleExport} color="primary">Export</Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

PlaylistButton.propTypes = {
    listId: PropTypes.string,
    onNewSong: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    selectedRows: PropTypes.arrayOf(PropTypes.string).isRequired,
};
  

export default PlaylistButton;
