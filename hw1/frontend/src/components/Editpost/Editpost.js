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
    photo: '',
    lastModified: ''
  });

  const [tagInput, setTagInput] = useState(''); // Input for adding tags
  const [selectedFile, setSelectedFile] = useState(null); // Selected file for photo upload

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

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0]; // Get the first selected file
    if (selectedFile) {
      uploadPhotoAndGetInfo(selectedFile)
        .then((result) => {
          setPost({
            ...post,
            photo: result.photo,
          });
        })
      setSelectedFile(selectedFile);
    }
  };

  // Function to upload a photo and get its path and name as a response
  const uploadPhotoAndGetInfo = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject('No file selected');
      }

      // Create a FormData object to include the selected file in the request
      const formData = new FormData();
      formData.append('photo', file); // Use 'photo' or the field name your server expects

      // Send a POST request to upload the photo
      axios.post('http://localhost:8000/photos/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const { photo } = response.data;
          resolve({ photo });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };


  const handleSaveClick = () => {
    console.log(post);
    if (id) {
      console.log(post.photo);
      axios.put(`http://localhost:8000/posts/${id}`, post)
        .then(() => {
          navigate(`/view/${id}`);
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
        <div>
          <label>Upload Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>
        {selectedFile && (
          <div>
            <label>Uploaded Photo Preview:</label>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded"
              style={{ maxWidth: '100px' }}
            />
          </div>
        )}
        {!selectedFile && post.photo && (
          <div>
            <label>Uploaded Photo Preview:</label>
            <img
              src={post.photo}
              alt="Uploaded"
              style={{ maxWidth: '100px' }}
            />
          </div>
        )}
      </form>
      <button onClick={handleSaveClick}>Save</button>
    </div>
  );
}
