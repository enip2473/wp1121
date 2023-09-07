// src/components/PostDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
const apiRoot = "http://localhost:8000/api";

async function getSinglePost(postId) {
  const response = await fetch(`${apiRoot}/posts/${postId}`);
  const data = await response.json();
  return data;
}

function PostDetail() {
  const { postId } = useParams();
  const post = getSinglePost(postId);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export default PostDetail;
