import { useState } from "react";

import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TextField, Button, Box, Typography } from "@mui/material";

import AddPlaylist from "./AddPlaylist";

// adjust the path if necessary

type MainHeaderProps = {
  isDeleteMode: boolean;
  setIsDeleteMode: (mode: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

function MainHeader({
  isDeleteMode,
  setIsDeleteMode,
  searchTerm,
  setSearchTerm,
}: MainHeaderProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
      mb={2}
    >
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add
        </Button>
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={() => setIsDeleteMode(!isDeleteMode)}
        >
          {isDeleteMode ? "Done" : "Delete"}
        </Button>
      </Box>
      <AddPlaylist open={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}

export default MainHeader;
