import { useState } from 'react';
import { Button, Box, Typography } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import AddPlaylist from './AddPlaylist';  // adjust the path if necessary

function MainHeader({ setIsDeleteMode, isDeleteMode }: any) {
    const [isDialogOpen, setDialogOpen] = useState(false);
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4">My playlists</Typography>
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
