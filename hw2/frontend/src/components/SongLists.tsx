import { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import axiosInstance from './AxiosConfig'
import SongListCard from './SongListCard'; // Adjust the import path
import { ReceivedPlaylist } from '@lib/shared_types';

type SongListsProps = {
  isDeleteMode: boolean;
  searchTerm: string;
};

function SongLists({isDeleteMode, searchTerm}: SongListsProps) {
  const [songLists, setSongLists] = useState<ReceivedPlaylist[]>([]);
  const handleDelete: (id: string) => Promise<void> = async (id) => {
    try {
        const response = await axiosInstance.delete(`/lists/${id}`);
        if (response.status === 200) {
            setSongLists((prevLists: ReceivedPlaylist[]) => prevLists.filter((list: ReceivedPlaylist) => list._id !== id));
        } else {
            console.error('Failed to delete the playlist.');
        }
    } catch (error) {
        console.error('There was an error deleting the playlist:', error);
    }
  };
  useEffect(() => {
    async function fetchSongLists() {
      try {
        const response = await axiosInstance.get('/lists');  // Adjust the endpoint if necessary
        setSongLists(response.data);
      } catch (error) {
        console.error("Error fetching song lists:", error);
      }
    }
    fetchSongLists();
  }, []);
  const filteredList = songLists.filter(
    list => list.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Grid container spacing={3}>
      {filteredList.map((list) => (
        <Grid item key={list._id} xs={6} sm={4} md={2}>
          <SongListCard list={list} isDeleteMode={isDeleteMode} handleDelete={handleDelete} />
        </Grid>
      ))}
    </Grid>
  );
}

export default SongLists;
