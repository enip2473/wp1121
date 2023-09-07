// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import PostDetail from './components/PostDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/posts/:postId" component={PostDetail} />
      </Routes>
    </Router>
  );
}

export default App;
