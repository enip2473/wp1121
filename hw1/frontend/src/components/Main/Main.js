import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Main() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts from the backend API when the component mounts
    axios.get('http://localhost:8000/posts')
      .then((response) => {
        setPosts(response.data); // Update the posts state with the fetched data
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <div>
      <h2>Main Page</h2>
      {/* Add your filter component here */}
      
      <Link to="/edit">
        <button>Create New Post</button>
      </Link>

      <div>
        {posts.map((post) => (
          <div key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.date}</p>
            <p>{post.content}</p>
            <Link to={`/view/${post._id}`}>View Post</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
