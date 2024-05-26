import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  savePost,
  profilePosts,
  getNotificationNumber,
  rateUser,
  getUserRatingByRater
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/save", verifyToken, savePost);
router.get("/profilePosts", verifyToken, profilePosts);
router.get("/notification", verifyToken, getNotificationNumber);
router.post("/:id/rate", verifyToken, rateUser); // Add the new route
router.get("/:id", verifyToken, getUser);
router.get("/:id/my-rating", verifyToken, getUserRatingByRater);

export default router;