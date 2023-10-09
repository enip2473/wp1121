import { useState } from 'react';
import { TextField, Button, Box, Typography } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import AddPlaylist from './AddPlaylist';  // adjust the path if necessary

function MainHeader({ setIsDeleteMode, isDeleteMode, searchTerm, setSearchTerm }: any) {
    const [isDialogOpen, setDialogOpen] = useState(false);
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
            <Typography variant="h6">My playlists</Typography>
            <Box>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                />
            </Box>
            <Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                    Add
                </Button>
                <Button variant="contained" startIcon={<DeleteIcon />} onClick={() => setIsDeleteMode((prev: boolean) => (!prev))}>
                    {isDeleteMode ? "Cancel" : "Delete"}
                </Button>
            </Box>
            <AddPlaylist open={isDialogOpen} onClose={() => setDialogOpen(false)} />
        </Box>
    );
}

export default MainHeader;
