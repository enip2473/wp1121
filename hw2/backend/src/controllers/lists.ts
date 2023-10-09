import ListModel, { type IList } from "../models/list";
import type { Request, Response } from "express";

export const createList = async (req: Request, res: Response) => {
  try {
    const existingList = await ListModel.findOne({ name: req.body.name });
    if (existingList) {
      res.status(409).send("A list with same name exists!");
    } else {
      const list: IList = new ListModel(req.body);
      await list.save();
      res.status(201).send(list);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getAllLists = async (_req: Request, res: Response) => {
  try {
    const lists = await ListModel.find({});
    res.status(200).send(lists);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getListById = async (req: Request, res: Response) => {
  try {
    const list = await ListModel.findById(req.params.id).populate("songs"); // Again, populating songs for detail
    if (!list) {
      res.status(404).send("List not found");
      return;
    }
    res.status(200).send(list);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateListById = async (req: Request, res: Response) => {
  try {
    const existingList = await ListModel.findOne({ name: req.body.name });
    if (existingList && existingList._id.toString() !== req.body._id) {
      res.status(409).send("A list with same name exists!");
      return;
    }
    const list = await ListModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!list) {
      res.status(404).send("List not found");
      return;
    }
    res.status(200).send(list);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const deleteListById = async (req: Request, res: Response) => {
  try {
    const list = await ListModel.findByIdAndDelete(req.params.id);
    if (!list) {
      res.status(404).send("List not found");
      return;
    }
    res.status(200).send(list);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const songsOfList = async (req: Request, res: Response) => {
  try {
    const list = await ListModel.findById(req.params.id).populate("songs");
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    res.json(list.songs); // Returns all the songs associated with the list
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSongsOfList = async (req: Request, res: Response) => {
  try {
    const { songIds } = req.body;
    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    songIds.forEach((songId: string) => {
      if (!list.songs.includes(songId)) {
        list.songs.push(songId);
      }
    });
    await list.save();
    res.json({ success: true, list });
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteSongsFromList = async (req: Request, res: Response) => {
  try {
    const { songIds } = req.body; // Expecting an array of song IDs to be removed
    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    list.songs = list.songs.filter(
      (songId) => !songIds.includes(songId.toString()),
    );
    await list.save();
    res.json({ success: true, list });
  } catch (error) {
    console.error("Error deleting songs from list:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
