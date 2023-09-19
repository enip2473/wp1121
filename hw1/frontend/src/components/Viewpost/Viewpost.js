import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatTime } from '../Common/Common'
import { Link } from 'react-router-dom';
import './Viewpost.css'; 


export default function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const backend_url = "http://localhost:8000";
  useEffect(() => {
    // Fetch the post by ID when the component mounts
    axios.get(`${backend_url}/posts/${id}`)
      .then((response) => {
        setPost(response.data); // Update the post state with the fetched data
      })
      .catch((error) => {
        console.error('Error fetching post:', error);
      });
  }, [id]);

  return (
    <div className="view-post-container">
      <div className="view-post-header">
        <div className="view-post-date">{post.date && formatTime(post.date)}</div>
        <div className="view-post-title">{post.title}</div>
        <div className="buttons">
            <Link to="/" className="home-edit-button">
              Home
            </Link>
            <Link to={`/${post._id}/edit`} className="home-edit-button">
              Edit
            </Link>
        </div>
      </div>

      <div className="view-post-content">
        <div className="view-post-left">
          <div className="view-post-tags">
            {post.tags && post.tags.map((tag, index) => (
              <div className='view-tags' key={index}>{tag}</div>
            ))}
          </div>
          <div className="view-post-moods">
            {post.moods && post.moods.map((mood, index) => (
              <div className='view-moods' key={index}>{mood}</div>
            ))}
          </div>
        </div>
        <div className="view-post-right">
          {post.photo && (
            <img src={post.photo} alt=""/>
          )}
        </div>
      </div>

      <div className="view-post-content-text">
        {post.content}
      </div>

    </div>
  );
}

