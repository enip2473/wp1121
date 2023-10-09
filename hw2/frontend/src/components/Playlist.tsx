import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from './AxiosConfig'; // Adjust the path as per your setup
import Container from '@mui/material/Container';
import PlaylistHeader from './PlaylistHeader';
import PlaylistButton from './PlaylistButton';
import Songs from './Songs';
import type {Song, ReceivedSong, ReceivedPlaylist, CreateSong} from '@lib/shared_types'
import type { GridRowSelectionModel } from '@mui/x-data-grid';

const PlaylistDetails = () => {
  const { id } = useParams<string>();
  const [playlist, setPlaylist] = useState<ReceivedPlaylist>({
    _id: '',
    name: '',
    description: '',
    songs: [],
  });

  const handleNewSong = async (song: CreateSong) => {
    let sameSong = false;
    for (const oldSong of playlist.songs) {
      if (oldSong.title === song.title) {
        sameSong = true;
        alert('A song with same title exists!')
      }
    }   
    if (sameSong) return; 
    try {
      const response = await axiosInstance.post('/songs', song);
      const songId = response.data._id; 
      const listResponse = await axiosInstance.put(`/lists/${id}/songs`, { songIds: [songId] })
      if (!listResponse.data.success) {
        console.error('Error updating list:', response.data.message);
      }
      setPlaylist(prev => {
        return {
          ...prev,
          songs: [...prev.songs, {_id: songId, ...song}]
        };
      });
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (selectedSongs: GridRowSelectionModel) => {
    if (selectedRows.length === 0) {
      alert('Select the songs you want to delete!');
      return
    }
    // Filtering out the selected songs
    const userConfirmed = window.confirm("Are you sure you want to delete the selected songs?");
    if (!userConfirmed) return;
    // Using DELETE method for the request
    axiosInstance.delete(`/lists/${id}/songs`, { data: { songIds: selectedSongs } })
    .then(response => {
      if (!response.data.success) {
        console.error('Error deleting songs from list:', response.data.message);
      }
    })
    .catch(error => {
      console.error('Error deleting songs from list:', error);
    });

    setPlaylist(prev => {
      return {
        ...prev,
        songs: prev.songs.filter(song => !selectedSongs.includes(song._id))
      };
    });
  };

  useEffect(() => {
    async function fetchPlaylistDetails() {
      try {
        const response = await axiosInstance.get(`/lists/${id}`);
        setPlaylist(response.data);
      } catch (error) {
        console.error('Error fetching playlist details:', error);
      }
    }
    fetchPlaylistDetails();
  }, [id]);

  const [rows, setRows] = useState<Song[]>([]);
  const [selectedRows, setselectedRows] = useState<GridRowSelectionModel>([]);
  useEffect(() => {
    axiosInstance.get(`lists/${id}/songs`)
      .then(response => {
        const fetchedSongs = response.data.map((song: ReceivedSong) => ({
          id: song._id,
          title: song.title,
          author: song.author,
          link: song.link
        }));
        setRows(fetchedSongs);
      })
      .catch(error => {
          console.error('Error fetching songs:', error);
      });
  }, [id, playlist]);  


  if (!playlist) return <div>Loading...</div>;
  return (
    <Container>
      <PlaylistHeader playlist={playlist} setPlaylist={setPlaylist}/>
      <PlaylistButton listId={id} onNewSong={handleNewSong} onDelete={() => handleDelete(selectedRows)} selectedRows={selectedRows}/>
      <Songs rows={rows} selectedRows={selectedRows} setSelectedRows={setselectedRows}/>
    </Container>
  );
};

export default PlaylistDetails;
