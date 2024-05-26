import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import List from "../../components/list/List";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProfileUser.scss";

function ProfileUser() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingData, setRatingData] = useState({
    ratedValue: null,
    avgRating: 0,
    numberOfRatings: 0,
    showRating: false,
  });
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userDataResponse, userPostsResponse, userRatingResponse] = await Promise.all([
          apiRequest.get(`/users/${userId}`),
          apiRequest.get(`/posts/user/${userId}`),
          apiRequest.get(`/users/${userId}/my-rating`)
        ]);

        const { avgRating, numberOfRatings, ...userData } = userDataResponse.data;
        setUser(userData);
        setUserPosts(userPostsResponse.data);

        setRatingData({
          ratedValue: userRatingResponse.data.rating,
          avgRating: avgRating !== undefined ? avgRating : 0,
          numberOfRatings: numberOfRatings !== undefined ? numberOfRatings : 0,
          showRating: false,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleRating = async (rating) => {
    try {
      const response = await apiRequest.post(`/users/${userId}/rate`, { rating });
      toast.success("Rating submitted successfully!");

      // Update the rating data state immediately
      setRatingData((prev) => ({
        ...prev,
        ratedValue: rating,
        avgRating: response.data.avgRating,
        numberOfRatings: response.data.numberOfRatings,
        showRating: false,
      }));
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Error submitting rating. Please try again later.");
      toast.error("Failed to submit rating.");
    }
  };

  const handleShowRating = () => {
    setRatingData((prev) => ({ ...prev, showRating: true }));
    toast.info("Please rate this user:");
  };

  return (
    <div className="profileUser">
      <ToastContainer />
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
          </div>
          <div className="info">
            {loading ? (
              <p>Loading user information...</p>
            ) : (
              user && (
                <>
                  <span>
                    Avatar:
                    <img
                      src={user.avatar || "/noavatar.jpg"}
                      alt="Avatar"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  </span>
                  <span>
                    Username: <b>{user.username}</b>
                  </span>
                  <span>
                    E-mail: <b>{user.email}</b>
                  </span>
                  <span>
                    Rating:{" "}
                    <b>
                      {ratingData.avgRating
                        ? ratingData.avgRating.toFixed(1)
                        : "N/A"}
                      /5
                    </b>{" "}
                    ({ratingData.numberOfRatings} ratings)
                  </span>
                  <span>
                    Your Rating:{" "}
                    {ratingData.ratedValue !== null ? (
                      <Rater
                        total={5}
                        rating={ratingData.ratedValue}
                        onRate={({ rating }) => handleRating(rating)}
                        style={{ fontSize: 30, color: "yellow" }}
                      />
                    ) : !ratingData.showRating ? (
                      <button onClick={handleShowRating} className="rateButton">
                        Add a Rating
                      </button>
                    ) : (
                      <div className="ratingContainer">
                        <Rater
                          total={5}
                          rating={0}
                          onRate={({ rating }) => handleRating(rating)}
                          style={{ fontSize: 30, color: "yellow" }}
                        />
                      </div>
                    )}
                  </span>
                </>
              )
            )}
          </div>
          <div className="title">
            <h1>User Posts</h1>
          </div>
          <div className="userPosts">
            {loading ? (
              <p>Loading user posts...</p>
            ) : (
              <List posts={userPosts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUser;