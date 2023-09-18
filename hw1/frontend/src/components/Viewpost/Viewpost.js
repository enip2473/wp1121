import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatTime } from '../Common/Common'
import { Link } from 'react-router-dom';
import './Viewpost.css'; 


export default function ViewPost() {
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


  return (
    <div className="view-post-container">
      <div className="view-post-header">
        <div className="view-post-date">{post.date && formatTime(post.date)}</div>
        <div className="view-post-title">{post.title}</div>
        <div className="buttons">
            <Link to="/" className="home-edit-button">
              Home
            </Link>
            <Link to={`/edit/${post._id}`} className="home-edit-button">
              Edit
            </Link>
        </div>
      </div>

      <div className="view-post-content">
        <div className="view-post-left">
          <div className="view-post-tags">
            {post.tags && post.tags.map((tag, index) => (
              <div className='view-tags'>{tag}</div>
            ))}
          </div>
          <div className="view-post-content-text">
            {post.content}
          </div>
        </div>

        {/* Right Side (Photo) */}
        <div className="view-post-right">
          {post.photo && (
            <img src={post.photo} alt=""/>
          )}
        </div>
      </div>
    </div>
  );
}

// export default function Viewpost() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [post, setPost] = useState({});

//   useEffect(() => {
//     // Fetch the post by ID when the component mounts
//     axios.get(`http://localhost:8000/posts/${id}`)
//       .then((response) => {
//         setPost(response.data); // Update the post state with the fetched data
//       })
//       .catch((error) => {
//         console.error('Error fetching post:', error);
//       });
//   }, [id]);

//   const handleEditClick = () => {
//     navigate(`/edit/${id}`);
//   };

//   return (
//     <div>
//       <h2>View Post</h2>
//       {/* Display post content here */}
//       <div>
//         <h3>Title: {post.title}</h3>
//         <p>Date: {post.date && formatTime(post.date)}</p>
//         <p>Tags:</p>
//         <ul>
//           {post.tags && post.tags.map((tag, index) => (
//             <li key={index}>{tag}</li>
//           ))}
//         </ul>
//         <p>Content: {post.content}</p>
//         {post.photo && (
//           <div>
//             <p>Photo:</p>
//             <img
//               src={post.photo}
//               alt="hi"
//               style={{ maxWidth: '100%' }}
//             />
//           </div>
//         )}
//       </div>
//       <button onClick={handleEditClick}>Edit Post</button>
//     </div>
//   );
// }
