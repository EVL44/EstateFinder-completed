import { useContext } from "react";
import CountUp from "react-countup"; 
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Your Dream Property with Smsar EstateFinder</h1>
          <p>
            Welcome to Smsar EstateFinder, your premier destination for discovering exceptional real estate opportunities. Whether you're searching for a cozy home, a luxurious villa, or a bustling commercial space, we're here to guide you every step of the way.
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1><CountUp end={15} /> <span>+</span></h1>
              <h2>Years of Real Estate Expertise</h2>
            </div>
            <div className="box">
              <h1>
                <CountUp end={28} /> <span>+</span>
              </h1>
              <h2>Awards Recognizing Excellence</h2>
            </div>
            <div className="box">
              <h1><CountUp start={1980} end={2000} /> <span>+</span></h1>
              <h2>Properties Ready for Discovery</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;
