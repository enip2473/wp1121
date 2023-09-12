import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function Editpost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: '',
    date: '',
    tags: [], // Use 'tags' as an array
    content: '',
  });

  const [tagInput, setTagInput] = useState(''); // Input for adding tags

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/posts/${id}`)
        .then((response) => {
          setPost(response.data);
        })
        .catch((error) => {
          console.error('Error fetching post:', error);
        });
    }
  }, [id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPost({
      ...post,
      [name]: value,
    });
  };

  const handleTagInputChange = (event) => {
    setTagInput(event.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput)) {
      setPost({
        ...post,
        tags: [...post.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleSaveClick = () => {
    if (id) {
      axios.put(`http://localhost:8000/posts/${id}`, post)
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          console.error('Error updating post:', error);
        });
    } else {
      axios.post('http://localhost:8000/posts', post)
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          console.error('Error creating post:', error);
        });
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Post' : 'Create New Post'}</h2>
      <form>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="text"
            name="date"
            value={post.date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Tags:</label>
          <div>
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Add tags..."
            />
            <button type="button" onClick={handleAddTag}>
              Add Tag
            </button>
          </div>
          <ul>
            {post.tags.map((tag, index) => (
              <li key={index}>{tag}</li>
            ))}
          </ul>
        </div>
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            value={post.content}
            onChange={handleInputChange}
          />
        </div>
      </form>
      <button onClick={handleSaveClick}>Save</button>
    </div>
  );
}
