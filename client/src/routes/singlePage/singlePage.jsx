import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const isCurrentUserPost = currentUser && currentUser.id === post.userId;

  useEffect(() => {
    setSaved(post.isSaved);
  }, [post]);

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleSendMessage = async () => {
    try {
      const existingChatResponse = await apiRequest.get("/chats");
      const existingChat = existingChatResponse.data.find((chat) =>
        chat.userIDs.includes(post.userId)
      );

      if (existingChat) {
        navigate("/profile");
      } else {
        await apiRequest.post("/chats", {
          receiverId: post.userId,
        });

        navigate("/profile");
      }
    } catch (error) {
      console.error("Failed to create or check chat:", error);
    }
  };

  const handleDeletePost = async () => {
    toast.info(
      <>
        Are you sure you want to delete this post?
        <div className="confirmation-buttons">
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      </>,
      {
        toastId: "confirm-delete",
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  };

  const confirmDelete = async () => {
    toast.dismiss("confirm-delete");
    try {
      await apiRequest.delete(`/posts/${post.id}`);
      toast.success("Post deleted successfully.", { toastId: "delete-success" });
      navigate("/"); 
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.", { toastId: "delete-error" });
    }
  };

  const cancelDelete = () => {
    toast.dismiss("confirm-delete");
    toast.warn("Post deletion canceled.", { toastId: "cancel-delete" });
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                {isCurrentUserPost ? (
                  <img src={post.user.avatar || "/noavatar.jpg"} alt="" />
                ) : (
                  <Link to={`/profile/${post.userId}`}>
                    <img src={post.user.avatar || "/noavatar.jpg"} alt="" />
                  </Link>
                )}
                <span>{post.user.username}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>

          <div className="buttons">
            {!isCurrentUserPost && (
              <button onClick={handleSendMessage}>
                <img src="/chat.png" alt="" />
                Send a Message
              </button>
            )}
            {isCurrentUserPost && (
              <>
                <Link to={`/update-post/${post.id}`}>
                  <button>
                    <img src="/update.png" alt="" />
                    Update Post
                  </button>
                </Link>
                <button onClick={handleDeletePost}>
                  <img src="/delete.png" alt="" />
                  Delete Post
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;