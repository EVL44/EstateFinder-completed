import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faTrashAlt, faReply } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { toast } from "react-toastify";
import Slider from "../../components/slider/Slider";
import "./commentPage.scss";

function CommentsPage() {
  const { userId, postId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [likedComments, setLikedComments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, postDataResponse, commentsResponse] = await Promise.all([
          apiRequest.get(`/users/${userId}`),
          apiRequest.get(`/posts/${postId}`),
          apiRequest.get(`/comments/${postId}`)
        ]);
        setUser(userDataResponse.data);
        setPost(postDataResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        setError("Error fetching data. Please try again later.");
        console.error("Error fetching data:", error);
      } finally {
        setLoadingUser(false);
        setLoadingPost(false);
      }
    };

    fetchData();
  }, [userId, postId]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveComment", (comment) => {
        console.log("Received new comment via socket:", comment);
        setComments((prevComments) => {
          const existingComment = prevComments.find((c) => c.id === comment.id);
          if (existingComment) {
            return prevComments.map((c) => (c.id === comment.id ? comment : c));
          } else {
            return [...prevComments, comment];
          }
        });
      });


      socket.on("receiveReply", (reply) => {
        console.log("Received new reply via socket:", reply);
        setComments((prevComments) => {

          const updatedComments = prevComments.map((comment) => {

            if (comment.id === reply.commentId) {

              const existingReply = comment.replies.find((r) => r.id === reply.id);
              if (existingReply) {

                return {
                  ...comment,
                  replies: comment.replies.map((r) => (r.id === reply.id ? reply : r)),
                };
              } else {

                return {
                  ...comment,
                  replies: [...comment.replies, reply],
                };
              }
            }
            return comment;
          });
          return updatedComments;
        });
      });

      socket.on("receiveDeleteReply", (replyId) => {
        console.log("Received deleted reply via socket:", replyId);
        setComments((prevComments) =>
          prevComments.map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          }))
        );
      });


      socket.on("likeComment", (commentId) => {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          )
        );
      });

      socket.on("unlikeComment", (commentId) => {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes - 1 }
              : comment
          )
        );
      });



    }

    return () => {
      if (socket) {
        socket.off("receiveComment");
        socket.off("receiveReply");
        socket.off("receiveDeleteReply");
        socket.off("likeComment");
        socket.off("unlikeComment");
      }
    };
  }, [socket]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.post(`/comments/${postId}`, {
        text: newComment,
        userId: currentUser.id,
      });

      const newCommentData = {
        ...response.data,
        user: {
          username: currentUser.username || "Anonymous",
          avatar: currentUser.avatar || "/noavatar.jpg",
        },
        replies: [],
      };
      setComments((prevComments) => [...prevComments, newCommentData]);
      setNewComment("");
      socket.emit("newComment", newCommentData);
      console.log("New comment added:", newCommentData);
    } catch (error) {
      setError("Error adding comment. Please try again later.");
      console.error("Error adding comment:", error);
    }
  };

  const handleAddReply = async (commentId) => {
    try {
      const response = await apiRequest.post(`/comments/${commentId}/replies`, {
        text: replyText,
        userId: currentUser.id,
      });

      const newReplyData = {
        ...response.data,
        user: {
          username: currentUser.username || "Anonymous",
          avatar: currentUser.avatar || "/noavatar.jpg",
        },
        commentId,
      };

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyData] }
            : comment
        )
      );
      setReplyText("");
      setReplyingTo(null);
      socket.emit("newReply", newReplyData);
      console.log("New reply added:", newReplyData);
    } catch (error) {
      setError("Error adding reply. Please try again later.");
      console.error("Error adding reply:", error);
    }
  };



  const handleDeleteComment = async (commentId) => {
    try {

      const commentToDelete = comments.find((comment) => comment.id === commentId);
      if (commentToDelete.replies.length > 0) {

        toast.info("Cannot delete comment because it has replies.");
        return;
      }


      await apiRequest.delete(`/comments/${commentId}`);
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
      socket.emit("deleteComment", commentId);
      console.log("Deleted comment with id:", commentId);
    } catch (error) {
      setError("Error deleting comment. Please try again later.");
      console.error("Error deleting comment:", error);
    }
  };


  const handleDeleteReply = async (replyId, commentId) => {
    try {
      await apiRequest.delete(`/comments/replies/${replyId}`);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) }
            : comment
        )
      );
      socket.emit("deleteReply", replyId);
      console.log("Deleted reply with id:", replyId);
    } catch (error) {
      setError("Error deleting reply. Please try again later.");
      console.error("Error deleting reply:", error);
    }
  };


  useEffect(() => {
    if (socket) {
      socket.on("commentDeleted", (deletedCommentId) => {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== deletedCommentId)
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("commentDeleted");
      }
    };
  }, [socket]);





  const getLikedCommentsFromStorage = () => {
    const likedComments = localStorage.getItem('likedComments');
    return likedComments ? JSON.parse(likedComments) : [];
  };


  const storeLikedCommentsInStorage = (likedComments) => {
    localStorage.setItem('likedComments', JSON.stringify(likedComments));
  };


  useEffect(() => {
    const likedComments = getLikedCommentsFromStorage();
    setLikedComments(likedComments);
  }, []);

  const handleLikeComment = async (commentId) => {
    try {
      if (likedComments.includes(commentId)) {
        await apiRequest.delete(`/comments/${commentId}/unlike`);
        setLikedComments(likedComments.filter((id) => id !== commentId));
        socket.emit("unlikeComment", commentId);
      } else {
        await apiRequest.post(`/comments/${commentId}/like`);
        setLikedComments([...likedComments, commentId]);
        socket.emit("likeComment", commentId); // Emit event for like
      }
    } catch (error) {
      setError("Error liking/unliking comment. Please try again later.");
    }
  };


  return (
    <div className="commentsPage">
      {error && <p>{error}</p>}
      {loadingUser || loadingPost ? (
        <p>Loading...</p>
      ) : (
        <>
          {user && post && (
            <>
              <div className="postImageContainer">
                
                <Slider images={post.images} />
                <div className="user">
                  <img src={user.avatar || "/noavatar.jpg"} alt="Avatar" />
                  <p>{user.username}</p>
                </div>
              </div>
              <div className="commentsSection">
                <div className="wrapper">
                  <div className="title">
                    <h1>Comments</h1>
                  </div>
                  <form className="commentForm" onSubmit={handleAddComment}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                    ></textarea>
                    <button type="submit">Submit</button>
                  </form>
                  <div className="commentsList">
                    {comments.map((comment) => (
                      <div className="comment" key={comment.id}>
                        <img src={comment.user?.avatar || "/noavatar.jpg"} alt="Avatar" />
                        <div className="commentDetails">
                          <span className="username">{comment.user?.username || "Anonymous"}</span>
                          <span className="timestamp">{new Date(comment.createdAt).toLocaleString()}</span>
                          <p>{comment.text}</p>
                          <div className="actions">
                            <button onClick={() => handleLikeComment(comment.id)} style={{ color: likedComments.includes(comment.id) ? 'blue' : '#555' }}>
                              <FontAwesomeIcon icon={faThumbsUp} /> Like ({comment.likes})
                            </button>
                            {currentUser.id === comment.userId && (
                              <button onClick={() => handleDeleteComment(comment.id)}>
                                <FontAwesomeIcon icon={faTrashAlt} /> Delete
                              </button>
                            )}
                            <button onClick={() => setReplyingTo(comment.id)}>
                              <FontAwesomeIcon icon={faReply} /> Reply
                            </button>
                          </div>
                          <div className="replies">
                            {comment.replies && comment.replies.map((reply) => (
                              <div className="reply" key={reply.id}>
                                <img src={reply.user?.avatar || "/noavatar.jpg"} alt="Avatar" />
                                <div className="replyDetails">
                                  <span className="username">{reply.user?.username || "Anonymous"}</span>
                                  <span className="timestamp">{new Date(reply.createdAt).toLocaleString()}</span>
                                  <p>{reply.text}</p>
                                  {currentUser.id === reply.userId && (
                                    <button onClick={() => handleDeleteReply(reply.id, comment.id)}>
                                      <FontAwesomeIcon icon={faTrashAlt} /> Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {replyingTo === comment.id && (
                              <div className="replyInput">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                />
                                <button onClick={() => handleAddReply(comment.id)}>Send</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CommentsPage;
