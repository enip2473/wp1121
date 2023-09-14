import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CustomDatePicker from '../Datepicker/Datepicker'; // Adjust the import path


export default function Editpost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: '',
    date: 0,
    tags: [], // Use 'tags' as an array
    content: '',
    photo: '',
    lastModified: 0
  });

  const [tagInput, setTagInput] = useState(''); // Input for adding tags
  const [selectedFile, setSelectedFile] = useState(null); // Selected file for photo upload
  const [selectedDate, setSelectedDate] = useState(undefined);
  
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/posts/${id}`)
      .then((response) => {
        setPost(response.data);
        if (response.data.date) {
          setSelectedDate(new Date(response.data.date));
        }
      })
      .catch((error) => {
        console.error('Error fetching post:', error);
      });
    }
  }, [id]);
  

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setPost({
      ...post,
      date: date,
    });
  };

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
      setSelectedFile(selectedFile);
    }
  };

  // Function to upload a photo and get its path and name as a response
  const uploadPhotoAndGetInfo = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject('No file selected');
      }

      const formData = new FormData();
      formData.append('photo', file); // Use 'photo' or the field name your server expects

      // Send a POST request to upload the photo
      axios.post('http://localhost:8000/photos/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const
           { photo } = response.data;
          resolve({ photo });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };


  const postToBackend = (post) => {
    if (id) {
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
          navigate(`/view/${post.id}`);
        })
        .catch((error) => {
          console.error('Error creating post:', error);
        });
    }
  }

  const handleSaveClick = () => {
    if (selectedFile) {
      uploadPhotoAndGetInfo(selectedFile)
        .then((response) => {
          post.photo = response.photo;
        })
        .then(() => {
          postToBackend(post);
        })
    } else {
      postToBackend(post);
    }
  };

  const handleCancelClick = () => {
    if (id) {
      navigate(`/view/${id}`);
    } else {
      navigate('/');
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
          <CustomDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
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
      <button onClick={handleCancelClick}>Cancel</button>
    </div>
  );
}
