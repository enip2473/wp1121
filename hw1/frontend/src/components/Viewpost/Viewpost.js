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

  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  };
  return (
    <div>
      <h2>View Post</h2>
      {/* Display post content here */}
      <div>
        <h3>Title: {post.title}</h3>
        <p>Date: {post.date}</p>
        <p>Tags:</p>
        <ul>
          {post.tags && post.tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
        <p>Content: {post.content}</p>
      </div>
      <button onClick={handleEditClick}>Edit Post</button>
    </div>
  );
}
