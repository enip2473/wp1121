import {
  createList,
  getAllLists,
  getListById,
  updateListById,
  deleteListById,
  songsOfList,
  updateSongsOfList,
  deleteSongsFromList, // Assuming you'll create this controller
} from "../controllers/lists";
import express from "express";

const router = express.Router();

// CRUD operations for lists
router.route("/").get(getAllLists).post(createList);

router
  .route("/:id")
  .get(getListById)
  .put(updateListById)
  .delete(deleteListById);

// Operations related to songs of a list
router
  .route("/:id/songs")
  .get(songsOfList)
  .put(updateSongsOfList)
  .delete(deleteSongsFromList); // This is the new route for deleting songs from a list

export default router;
