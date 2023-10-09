import { SongModel, type ISong } from "../models/song";
import type { Request, Response } from "express";

// Adjust the path if necessary

export const createSong = async (req: Request, res: Response) => {
  try {
    const song: ISong = new SongModel(req.body);
    await song.save();
    res.status(201).send(song);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getAllSongs = async (_req: Request, res: Response) => {
  try {
    const songs = await SongModel.find({});
    res.status(200).send(songs);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getSongById = async (req: Request, res: Response) => {
  try {
    const song = await SongModel.findById(req.params.id);
    if (!song) {
      res.status(404).send("Song not found");
      return;
    }
    res.status(200).send(song);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateSongById = async (req: Request, res: Response) => {
  try {
    const song = await SongModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!song) {
      res.status(404).send("Song not found");
      return;
    }
    res.status(200).send(song);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const deleteSongById = async (req: Request, res: Response) => {
  try {
    const song = await SongModel.findByIdAndDelete(req.params.id);
    if (!song) {
      res.status(404).send("Song not found");
      return;
    }
    res.status(200).send(song);
  } catch (error) {
    res.status(500).send(error);
  }
};
