import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};


export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ratings = await prisma.rating.findMany({
      where: { userId: id },
    });

    const avgRating = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;
    const numberOfRatings = ratings.length;

    console.log("User ratings fetched:", { avgRating, numberOfRatings }); // Debug log

    res.status(200).json({ ...user, avgRating, numberOfRatings });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
};



export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save post!" });
  }
};


export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get notifications!" });
  }
};

export const rateUser = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  const raterId = req.userId;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating value" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the rater has already rated the user
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: id,
        raterId,
      },
    });

    if (existingRating) {
      // Update the existing rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      // Create a new rating
      await prisma.rating.create({
        data: {
          userId: id,
          raterId,
          rating,
        },
      });
    }

    // Recalculate the average rating and number of ratings
    const ratings = await prisma.rating.findMany({
      where: { userId: id },
    });
    const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
    const numberOfRatings = ratings.length;

    // Update the user with new average rating and number of ratings
    await prisma.user.update({
      where: { id },
      data: {
        avgRating,
        numberOfRatings,
      },
    });

    res.status(200).json({ message: "Rating submitted successfully", avgRating, numberOfRatings });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

export const getUserRatingByRater = async (req, res) => {
  const { id } = req.params;
  const raterId = req.userId;

  try {
    const rating = await prisma.rating.findFirst({
      where: {
        userId: id,
        raterId,
      },
    });

    if (!rating) {
     return res.status(200).json({ rating: null });
    }

    res.status(200).json({ rating: rating.rating });
  } catch (err) {
    console.error("Error fetching rating:", err);
    res.status(500).json({ message: "Failed to fetch rating" });
  }
};