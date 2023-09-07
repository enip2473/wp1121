// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
const apiRoot = "http://localhost:8000/api";

async function getPosts() {
  const response = await fetch(`${apiRoot}/todos`);
  const data = await response.json();
  return data;
}

function Home() {
  const posts = getPosts();
  return (
    <div>
      <h1>All Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
