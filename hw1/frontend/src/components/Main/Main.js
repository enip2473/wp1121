import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TagFilter from '../TagFilter/TagFilter';

export default function Main() {
  const [posts, setPosts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Callback function to handle filter changes
  const handleFilterChange = (tags) => {
    setSelectedTags(tags);
    // TODO select posts
  };

  useEffect(() => {
    // Fetch posts from the backend API when the component mounts
    axios.get('http://localhost:8000/posts')
      .then((response) => {
        // Sort posts by lastModified field in descending order (newest first)
        const sortedPosts = response.data.slice().sort((a, b) => {
          const dateA = new Date(a.lastModified);
          const dateB = new Date(b.lastModified);
          return dateB - dateA;
        });

        const filteredPosts = selectedTags.length === 0
        ? sortedPosts // No tags selected, show all posts
        : sortedPosts.filter((post) =>
            post.tags.some((tag) => selectedTags.includes(tag))
          );

        setPosts(filteredPosts); // Update the posts state with the sorted data
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once
  
  const availableTags = ['Tag1', 'Tag2', 'Tag3'];

  return (
    <div>
      <h2>Main Page</h2>
      <TagFilter tags={availableTags} onFilterChange={handleFilterChange} />

      
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
