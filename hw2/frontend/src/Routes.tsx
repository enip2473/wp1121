import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "@/components/Main";
import Playlist from "@/components/Playlist";
import HeaderBar from "@/components/HeaderBar";

export default function allRoutes() {
  return (
    <Router>
      <HeaderBar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/playlist/:id" element={<Playlist />} />
      </Routes>
    </Router>
  );
}
