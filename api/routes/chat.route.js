import express from "express";
import {
  getChats,
  getChat,
  addChat,
  readChat,
  deleteChat,
   // Import the function for soft deleting chats

} from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getChats);
router.get("/:id", verifyToken, getChat);
router.post("/", verifyToken, addChat);
router.put("/read/:id", verifyToken, readChat);
router.delete("/:id", verifyToken, deleteChat); // New route for deleting a chat

export default router;