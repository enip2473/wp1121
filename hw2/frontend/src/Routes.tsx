import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "@/components/Main";
import Playlist from "@/components/Playlist";

export default function allRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/playlist/:id" element={<Playlist />} />
      </Routes>
    </Router>
  );
}
