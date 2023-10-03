import { Request, Response } from 'express';
import ListModel, { IList } from '../models/list'; 

export const createList = async (req: Request, res: Response) => {
    try {
        const list: IList = new ListModel(req.body);
        await list.save();
        res.status(201).send(list);
    } catch (error: any) {
        res.status(400).send(error);
    }
};

export const getAllLists = async (_req: Request, res: Response) => {
    try {
        const lists = await ListModel.find({}).populate('songs'); // You can populate the songs if needed
        res.status(200).send(lists);
    } catch (error: any) {
        res.status(500).send(error);
    }
};

export const getListById = async (req: Request, res: Response) => {
    try {
        const list = await ListModel.findById(req.params.id).populate('songs'); // Again, populating songs for detail
        if (!list) {
            res.status(404).send("List not found");
            return;
        }
        res.status(200).send(list);
    } catch (error: any) {
        res.status(500).send(error);
    }
};

export const updateListById = async (req: Request, res: Response) => {
    try {
        const list = await ListModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!list) {
            res.status(404).send("List not found");
            return;
        }
        res.status(200).send(list);
    } catch (error: any) {
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
    } catch (error: any) {
        res.status(500).send(error);
    }
};
