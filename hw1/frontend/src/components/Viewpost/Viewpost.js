import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function Viewpost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({});

  useEffect(() => {
    // Fetch the post by ID when the component mounts
    axios.get(`http://localhost:8000/posts/${id}`)
      .then((response) => {
        setPost(response.data); // Update the post state with the fetched data
      })
      .catch((error) => {
        console.error('Error fetching post:', error);
      });
  }, [id]);

  console.log(typeof post.date)

  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  };

  function tolocaltime(dateString) {
    const dateUTC = new Date(dateString);
    const dateLocal = dateUTC.toLocaleString(); 
    const parts = dateLocal.split(' ')[0].split('/'); // Split the date string
    const year = parseInt(parts[0]);
    const month = String(parseInt(parts[1])).padStart(2, '0');
    const day = String(parseInt(parts[2])).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  return (
    <div>
      <h2>View Post</h2>
      {/* Display post content here */}
      <div>
        <h3>Title: {post.title}</h3>
        <p>Date: {post.date && tolocaltime(post.date)}</p>
        <p>Tags:</p>
        <ul>
          {post.tags && post.tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
        <p>Content: {post.content}</p>
        {post.photo && (
          <div>
            <p>Photo:</p>
            <img
              src={post.photo}
              alt="hi"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </div>
      <button onClick={handleEditClick}>Edit Post</button>
    </div>
  );
}
