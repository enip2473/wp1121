import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { v4 as uuid } from "uuid";

import { db } from "./db.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/heartbeat", (_, res) => {
  return res.send({ message: "Hello World!" });
});

app.get("/api/posts", (_, res) => {
  return res.status(200).json(db.posts);
});

app.get("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const todo = db.posts.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found!" });
  }
  return res.status(200).json(todo);
});

app.post("/api/posts", (req, res) => {
  const { title, description } = req.body;

  // check title and description
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required!" });
  }

  const todo = {
    id: uuid(),
    title,
    description,
    completed: false,
  };
  db.posts.push(todo);
  return res.status(201).json(todo);
});

app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const todo = db.posts.find((todo) => todo.id === id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found!" });
  }

  // update the todo
  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;

  return res.status(200).json(todo);
});

app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const todoIndex = db.posts.findIndex((todo) => todo.id === id);

  // if not found
  if (todoIndex === -1) {
    // not found
    return res.status(404).json({ message: "Todo not found!" });
  }
  // delete 1 item from index
  db.posts.splice(todoIndex, 1);

  return res.status(200).json({ message: "Todo deleted!" });
});

const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(`Server running on port http://localhost:${port}`),
);
