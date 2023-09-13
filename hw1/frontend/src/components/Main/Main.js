import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TagFilter from '../TagFilter/TagFilter';
import { formatTime } from '../Common/Common'

export default function Main() {
  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Callback function to handle filter changes
  const handleFilterChange = (tags, relationship) => {
    // Implement filtering logic based on selected tags and relationship
    // For example, filter posts based on tags and relationship
    let filteredPosts = [];
  
    if (relationship === "AND") {
      // Filter posts where all selected tags are present
      filteredPosts = allPosts.filter((post) =>
        tags.every((tag) => post.tags.includes(tag))
      );
    } else if (relationship === "OR") {
      // Filter posts where at least one selected tag is present
      filteredPosts = allPosts.filter((post) =>
        tags.some((tag) => post.tags.includes(tag))
      );
    } 

    setPosts(filteredPosts);

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

        setAllPosts(sortedPosts);
        setPosts(sortedPosts); // Update the posts state with the sorted data
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once
  

  useEffect(() => {
    // Fetch tags from the backend API when the component mounts
    axios.get('http://localhost:8000/tags')
      .then((response) => {
        console.log(response.data);
        const tags = response.data.map((obj) => obj.name);
        setAvailableTags(tags);
      })
      .catch((error) => {
        console.error('Error fetching tags:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once

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
            <p>{formatTime(post.date)}</p>
            <p>{post.content}</p>
            <Link to={`/view/${post._id}`}>View Post</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
