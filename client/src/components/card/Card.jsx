import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./card.scss";
import { toast } from "react-toastify";

function Card({ item }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      toast.warn("You need to log in to view this post!");
      navigate("/login");  
    }
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer" onClick={handleCardClick}>
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`} onClick={handleCardClick}>
            {item.title}
          </Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">$ {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div className="icon">
              <Link to={`/comments/${item.userId}/${item.id}`}>
                <img src="/comment.png" alt="" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;