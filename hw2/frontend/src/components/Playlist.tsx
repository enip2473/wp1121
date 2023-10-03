import { useParams } from 'react-router-dom';
import axiosInstance from './AxiosConfig'; // Adjust the path as per your setup
import { useEffect, useState } from 'react';

const PlaylistDetails = () => {
    const { id } = useParams();  // This hook gives us access to the route parameters
    const [playlist, setPlaylist] = useState<any>(null);

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

    if (!playlist) return <div>Loading...</div>;
    // TODO
    return (
        <>
            <PlaylistHeader/>
            <PlaylistButton/>
            <Songs/>
            <h2>{playlist.name}</h2>
            {/* Display songs and other details of the playlist */}
        </>
    );
};

export default PlaylistDetails;
