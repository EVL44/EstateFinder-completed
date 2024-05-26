import React from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./aboutPage.scss";

function AboutPage() {
  return (
    <div className="aboutPage">
      <h1 className="title">About Us</h1>
      <div className="textContainer">
        <div className="wrapper">
          <p>
            At <strong>Smsar EstateFinder</strong>, we are passionate about connecting people with their dream homes. Whether you are looking for a cozy apartment in the city or a spacious countryside estate, we have you covered.
          </p>
          {/* Additional content */}
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg-about.png" alt="" />
      </div>
    </div>
  );
}

export default AboutPage;
