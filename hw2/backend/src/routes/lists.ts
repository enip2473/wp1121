import {
  createList,
  getAllLists,
  getListById,
  updateListById,
  deleteListById,
} from "../controllers/lists";
import express from "express";

const router = express.Router();

// GET /api/lists
router.get("/", getAllLists);
// GET /api/lists/:id
router.get("/:id", getListById);
// POST /api/lists
router.post("/", createList);
// PUT /api/lists/:id
router.put("/:id", updateListById);
// DELETE /api/lists/:id
router.delete("/:id", deleteListById);

// export the router
export default router;
