import prisma from "../lib/prisma.js";

/// Get all comments for a specific post
export const getComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: true, // Include user data for the comment
        replies: {
          include: {
            user: true, // Include user data for each reply
          },
        },
      },
    });

    // No need to manually map over comments to include user data as it's already included by Prisma
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text, userId } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        postId,
      },
      include: {
        user: true, // Include user data in the response
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};


// Update an existing comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { text },
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error updating comment" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
};

export const addReply = async (req, res) => {
  const { commentId } = req.params;
  const { text, userId } = req.body;
  try {
    const reply = await prisma.reply.create({
      data: {
        text,
        userId,
        commentId,
      },
      include: {
        user: true, // Include user data in the response
      },
    });
    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: "Error adding reply" });
  }
};



// Delete a reply
export const deleteReply = async (req, res) => {
  const { replyId } = req.params;
  try {
    await prisma.reply.delete({
      where: { id: replyId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting reply" });
  }
};



// Add a route and controller method to handle liking a comment
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    // Assuming you have a database table for comments with a 'likes' column
    // Increment the 'likes' column for the specified comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          increment: 1 // Increment the 'likes' column by 1
        }
      }
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: "Error liking comment" });
  }
};



// Unlike a comment
export const unlikeComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    // Decrement the 'likes' column for the specified comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          decrement: 1 // Decrement the 'likes' column by 1
        }
      }
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: "Error unliking comment" });
  }
};
