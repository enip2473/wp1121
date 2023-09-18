import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DropdownCheckbox from '../DropdownCheckbox/DropdownCheckbox';
import { formatTime } from '../Common/Common'
import './Main.css'; 


export default function Main() {
  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  let navigate = useNavigate(); 
  const routeChange = (path) => {navigate(path);}

  // Callback function to handle filter changes
  const handleFilterChange = (tags, relationship) => {
    // Implement filtering logic based on selected tags and relationship
    // For example, filter posts based on tags and relationship
    let filteredPosts = [];
  
    if (relationship === "AND") {
      filteredPosts = allPosts.filter((post) =>
        tags.every((tag) => post.tags.includes(tag))
      );
    } else if (relationship === "OR") {
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
        const tags = response.data.map((obj) => obj.name);
        setAvailableTags(tags);
      })
      .catch((error) => {
        console.error('Error fetching tags:', error);
      });
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <div className="main-page">
      <div className="header">
        <DropdownCheckbox availableTags={availableTags} onFilterChange={handleFilterChange} />
        <div className="diary-title">My Diary</div>
        <div>
          <Link to="/edit" className="new-post-button">
            New
          </Link>
        </div>
      </div>

      <div className="post-grid">
      {posts.map((post) => (
        <div key={post._id} className="post-block" onClick={()=>routeChange(`/view/${post._id}`)}>
          <h3 className="post-title">{post.title}</h3>
          <div className="post-body">
            <div className="left-body">
              <p className="post-date">{formatTime(post.date)}</p>
            </div>
            <div className="right-body">
              {
                post.tags.map((tag) => (
                  <div className='body-tag'>{tag}</div>
                ))
              }
            </div>
          </div>
          <div className="post-content">{post.content}</div>
        </div>
      ))}
      </div>
    </div>
  );
}


