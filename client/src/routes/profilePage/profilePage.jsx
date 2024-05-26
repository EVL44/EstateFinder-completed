import React, { Suspense, useContext, useEffect, useState, useCallback } from "react";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { toast } from "react-toastify";
import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import "./profilePage.scss";

function ProfilePage() {
  const data = useLoaderData();
  const { currentUser, fetchCurrentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      await fetchCurrentUser();
      if (currentUser) {
        setRating(currentUser.avgRating || 0);
      }
    } catch (error) {
      console.log("Error fetching current user data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
   
      await apiRequest.post("/auth/logout");
      updateUser(null);
      toast.success("Logout successful!");
    } catch (err) {
      console.log(err);
    } 
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <div className="avatar">
              Avatar:
              <img
                src={currentUser?.avatar || "noavatar.jpg"}
                alt="User Avatar"
              />
            </div>
            <div>
              Username: <b>{currentUser?.username}</b>
            </div>
            <div>
              E-mail: <b>{currentUser?.email}</b>
            </div>
            <div className="rating">
              Average Rating:
              <Rater
                total={5}
                rating={rating}
                interactive={false}
                style={{ fontSize: "25px" }}
                className="custom-rater"
              />
              ({currentUser?.numberOfRatings}{" "}
              {currentUser?.numberOfRatings === 1 ? "rating" : "ratings"})
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.userPosts} />}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts!</p>}
            >
              {(postResponse) => <List posts={postResponse.data.savedPosts} />}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>Error loading chats!</p>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;