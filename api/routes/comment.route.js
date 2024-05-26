import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  deleteReply,
  likeComment,
  unlikeComment ,
} from "../controllers/comment.controller.js";


const router = express.Router();
router.get("/:postId", getComments);
router.post("/:postId", addComment);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);
router.post("/:commentId/replies", addReply);
router.delete("/replies/:replyId", deleteReply);

// Inside your router
router.post("/:commentId/like", likeComment);
router.delete("/:commentId/unlike", unlikeComment);



export default router;
