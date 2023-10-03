import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Grid } from '@mui/material';
import axiosInstance from './AxiosConfig'
import { Link } from 'react-router-dom';

type SongList = {
    _id: string;            // MongoDB's ObjectID
    name: string;
    songs: string[];
    numberOfSongs: number;
};


const handleDelete = async (id: string, setSongLists: any) => {
  try {
      const response = await axiosInstance.delete(`/lists/${id}`);
      if (response.status === 200) {
          // Either refetch the song lists or remove the deleted one from the state
          setSongLists((prevLists: any) => prevLists.filter((list: any) => list._id !== id));
      } else {
          console.error('Failed to delete the playlist.');
      }
  } catch (error) {
      console.error('There was an error deleting the playlist:', error);
  }
};

function SongLists({isDeleteMode}: any) {
  const [songLists, setSongLists] = useState<SongList[]>([]);
  useEffect(() => {
    // Fetch the song lists using axios
    async function fetchSongLists() {
      try {
        const response = await axiosInstance.get('/lists');  // Adjust the endpoint if necessary
        setSongLists(response.data);
      } catch (error) {
        console.error("Error fetching song lists:", error);
      }
    }
    fetchSongLists();
  }, []);  // The empty dependency array means this useEffect runs once when the component mounts

  return (
    <Grid container spacing={3}>
      {songLists.map((list) => (
        <Grid item key={list._id} xs={12} sm={6} md={4}>
          <Card style={{ position: 'relative' }}>
            <Link to={`/playlist/${list._id}`} style={{ textDecoration: 'none' }}>
              <CardContent>
                {isDeleteMode && (
                  <Button 
                  style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                  onClick={() => handleDelete(list._id, setSongLists)}
                  >
                    X
                  </Button>
                )}
                <Typography variant="h5" component="div">
                  {list.name}
                </Typography>
                {/* You can add more details here like the number of songs in the list or even list the song names */}
              </CardContent>
            </Link>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default SongLists;
