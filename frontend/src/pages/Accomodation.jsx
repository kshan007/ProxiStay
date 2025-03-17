import { useNavigate } from "react-router-dom";
import { FaBuilding, FaHome, FaBed, FaUsers } from "react-icons/fa";
import "../styles/Accomodation.css"; //
import { ACCESS_TOKEN } from "../constants";

function Accommodation() {
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN)
  const isLoggedIn = !!token; 

  const handleSelection = (option) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="accommodation-container">
      {/* Navbar */}
      <div className="navbar">
        <h1 className="title">ProxiStay</h1>
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login / Register
        </button>
      </div>

      {/* Accommodation Options - Now Horizontal */}
      <div className="options-container">
        <button className="option-btn" onClick={() => handleSelection("PGs")}>
          <FaBuilding size={28} /> <span>PGs</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Apartments")}>
          <FaHome size={28} /> <span>Apartments</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Hostels")}>
          <FaBed size={28} /> <span>Hostels</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Shared Rooms")}>
          <FaUsers size={28} /> <span>Shared Rooms</span>
        </button>
      </div>
    </div>
  );
}
export default Accommodation