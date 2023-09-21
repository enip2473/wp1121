// Routes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main/Main";
import Viewpost from "./components/Viewpost/Viewpost";
import Editpost from "./components/Editpost/Editpost";

export default function myRoutes() {
  return (
    <Router>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Main />} />
        <Route path="/:id/view" element={<Viewpost />} />
        <Route path="/:id/edit" element={<Editpost />} />
        <Route path="/new" element={<Editpost />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
