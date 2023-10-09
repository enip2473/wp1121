import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import "./SongListCard.css"

const SongListCard = ({ list, isDeleteMode, handleDelete }: any) => {
  return (
    <Card style={{ position: 'relative' }} className={isDeleteMode ? "shake-animation" : ""}>

      <Link to={`/playlist/${list._id}`} style={{ textDecoration: 'none' }}>
        <Box 
            style={{ 
            height: '150px', 
            backgroundImage: `url("https://farm3.staticflickr.com/2439/12985065254_3e31ec34c6.jpg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
            }}
        >
            {isDeleteMode && (
            <IconButton 
                style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                onClick={() => handleDelete(list._id)}
            >
                <DeleteIcon />
            </IconButton>
            )}
        </Box>
        <CardContent>
          <Typography variant="h5" component="div">
            {list.name}
          </Typography>
          <Typography variant="body1" component="div" style={{ color: '#008000' }}>
            {list.songs.length} songs
          </Typography>
        </CardContent>
      </Link>
    
    </Card>
    );
}

export default SongListCard;
