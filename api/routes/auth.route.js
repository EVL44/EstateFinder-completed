import express from "express";
import {getCurrentUser,  login, logout, register } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/currentUser", getCurrentUser); 

export default router;