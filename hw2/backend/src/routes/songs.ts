// import {} from "../controllers/lists";
import {
  createSong,
  deleteSongById,
  getSongById,
  getAllSongs,
  updateSongById,
} from "../controllers/songs";
import express from "express";

const router = express.Router();

// GET /api/songs
router.get("/", getAllSongs);
// GET /api/songs/:id
router.get("/:id", getSongById);
// POST /api/songs
router.post("/", createSong);
// PUT /api/songs/:id
router.put("/:id", updateSongById);
// DELETE /api/songs/:id
router.delete("/:id", deleteSongById);

// export the router
export default router;
