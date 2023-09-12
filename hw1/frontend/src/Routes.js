// Routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main/Main';
import Viewpost from './components/Viewpost/Viewpost';
import Editpost from './components/Editpost/Editpost';

export default function myRoutes() {
  return (
    <Router>
      <Routes>
        {/* Define your routes here */}
        <Route path='/' element={<Main />}/>
        <Route path="/view/:id" element={<Viewpost />} />
        <Route path="/edit/:id" element={<Editpost />} />
        <Route path="/edit" element={<Editpost />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
