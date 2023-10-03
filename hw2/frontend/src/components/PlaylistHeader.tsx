import { Box, Typography } from '@mui/material';

const PlaylistHeader = () => {
  return(
    <Box display="flex" alignItems="center" marginBottom={4}>
      <Box marginRight={3}>
        <img src="path_to_your_image.jpg" alt="Playlist" width={200} height={200} />
      </Box>
      <Box>
        <Typography variant="h4">My Favorite1</Typography>
        <Typography variant="body1">
          Some description Some description Some description...
          {/* Repeat the description as per your needs */}
        </Typography>
      </Box>
    </Box>
  )
}

export default PlaylistHeader;
