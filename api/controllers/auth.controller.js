import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // HASH THE PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);

    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user!" });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ... (existing code)
  
    // CHECK IF THE USER EXISTS
    const user = await prisma.user.findUnique({
      where: { username },
    });
  
    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });
  
    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials!" });
  
    // GENERATE COOKIE TOKEN AND SEND TO THE USER
    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
  
    const { password: userPassword, ...userInfo } = user;
  
    // Include the avatar URL in the userInfo object
    userInfo.avatar = user.avatar;
  
    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};





export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userInfo } = user;
    res.status(200).json(userInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};