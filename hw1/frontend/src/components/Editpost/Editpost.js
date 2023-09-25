import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CustomDatePicker from "../Datepicker/Datepicker"; // Adjust the import path
import "./Editpost.css";

export default function Editpost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: "",
    date: new Date(),
    tags: [], // Use 'tags' as an array
    moods: [],
    content: "",
    photo: "",
    lastModified: 0,
  });

  const [tagInput, setTagInput] = useState(""); // Input for adding tags
  const [moodInput, setMoodInput] = useState(""); // Input for adding tags
  const [selectedFile, setSelectedFile] = useState(null); // Selected file for photo upload
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [allTags, setAllTags] = useState(null);
  const [allMoods, setAllMoods] = useState(null);
  const backend_url = "http://localhost:8000";

  useEffect(() => {
    if (id) {
      axios
        .get(`${backend_url}/posts/${id}`)
        .then((response) => {
          setPost(response.data);
          if (response.data.date) {
            setSelectedDate(new Date(response.data.date));
          }
        })
        .catch((error) => {
          console.error("Error fetching post:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    axios
      .get(`${backend_url}/tags`)
      .then((response) => {
        const tags = response.data.map((obj) => obj.name);
        setAllTags(tags);
      })
      .catch((error) => {
        console.error("Error fetching tags:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${backend_url}/moods`)
      .then((response) => {
        const moods = response.data.map((obj) => obj.name);
        setAllMoods(moods);
      })
      .catch((error) => {
        console.error("Error fetching moods:", error);
      });
  }, []);

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
    }
    setTagInput("");
  };

  const handleDeleteTag = (index) => {
    const updatedTags = [...post.tags];
    updatedTags.splice(index, 1);
    setPost({
      ...post,
      tags: updatedTags,
    });
  };

  const handleMoodInputChange = (event) => {
    setMoodInput(event.target.value);
  };

  const handleAddMood = () => {
    if (moodInput.trim() && !post.moods.includes(moodInput)) {
      setPost({
        ...post,
        moods: [...post.moods, moodInput.trim()],
      });
    }
    setMoodInput("");
  };

  const handleDeleteMood = (index) => {
    const updatedMoods = [...post.moods];
    updatedMoods.splice(index, 1);
    setPost({
      ...post,
      moods: updatedMoods,
    });
  };

  const convertImageToBase64 = (imageFile, callback) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64String = event.target.result; // Get the Base64 data part
      callback(base64String);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0]; // Get the first selected file
    if (selectedFile) {
      setSelectedFile(selectedFile);
    }
    convertImageToBase64(selectedFile, function (base64String) {
      setPost({
        ...post,
        photo: base64String,
      });
    });
  };

  const postToBackend = (post) => {
    if (id) {
      axios
        .put(`${backend_url}/posts/${id}`, post)
        .then(() => {
          navigate(`/${id}/view`);
        })
        .catch((error) => {
          console.error("Error updating post:", error);
        });
    } else {
      axios
        .post(`${backend_url}/posts`, post)
        .then(() => {
          navigate(`/`);
        })
        .catch((error) => {
          console.error("Error creating post:", error);
        });
    }
  };

  const handleSaveClick = () => {
    if (!post.content || !post.title) {
      alert("Title and Content are required.");
      return;
    }
    postToBackend(post);
  };

  const handleCancelClick = () => {
    if (id) {
      navigate(`/${id}/view`);
    } else {
      navigate("/");
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      axios
        .delete(`${backend_url}/posts/${id}`)
        .then(() => {
          navigate(`/`);
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
        });
    }
  };

  return (
    <div className="edit-post-container">
      <div className="edit-post-header">
        <div className="edit-post-date">
          <CustomDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>
        <div className="edit-post-title">
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleInputChange}
            placeholder="Title"
          />
        </div>
        <div className="buttons">
          <div className="home-edit-button" onClick={handleSaveClick}>
            Save
          </div>
          {post._id && (
            <div className="home-edit-button" onClick={handleDeleteClick}>
              Delete
            </div>
          )}
          <div className="home-edit-button" onClick={handleCancelClick}>
            Cancel
          </div>
        </div>
      </div>

      <div className="edit-post-content">
        <div className="edit-post-left">
          <div className="edit-post-tags">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Add tags..."
              list="tags"
            />
            <datalist id="tags">
              {allTags &&
                allTags.map((tag, index) => <option key={tag} value={tag} />)}
            </datalist>
            <button type="button" onClick={handleAddTag}>
              Add Tag
            </button>
          </div>
          <div className="all-tags">
            {post.tags &&
              post.tags.map((tag, index) => (
                <div className="tag-container" key={index}>
                  <div className="edit-tags">{tag}</div>
                  <span
                    className="delete-tag"
                    onClick={() => handleDeleteTag(index)}
                  >
                    &#x2716; {/* Unicode character for 'x' */}
                  </span>
                </div>
              ))}
          </div>
          <div className="edit-post-moods">
            <input
              type="text"
              value={moodInput}
              onChange={handleMoodInputChange}
              placeholder="Add moods..."
              list="moods"
            />
            <datalist id="moods">
              {allMoods &&
                allMoods.map((mood, index) => (
                  <option key={mood} value={mood} />
                ))}
            </datalist>
            <button type="button" onClick={handleAddMood}>
              Add Mood
            </button>
          </div>
          <div className="all-moods">
            {post.moods &&
              post.moods.map((mood, index) => (
                <div className="mood-container" key={index}>
                  <div className="edit-moods">{mood}</div>
                  <span
                    className="delete-mood"
                    onClick={() => handleDeleteMood(index)}
                  >
                    &#x2716;
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="edit-post-right">
          <div className="edit-photo">
            <div>Upload Photo</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              value=""
            />
          </div>
          {selectedFile && (
            <div>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded"
                style={{ maxWidth: "100px" }}
              />
            </div>
          )}
          {!selectedFile && post.photo && (
            <div>
              <img
                src={post.photo}
                alt="Uploaded"
                style={{ maxWidth: "100px" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="edit-post-content-text">
        <textarea
          name="content"
          value={post.content}
          onChange={handleInputChange}
          placeholder="Contents"
          style={{ width: "97%", height: "200px" }} // Use
        />
      </div>
    </div>
  );
}
