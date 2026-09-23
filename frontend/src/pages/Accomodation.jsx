import { useNavigate } from "react-router-dom";
import { FaBuilding, FaHome, FaBed, FaUsers } from "react-icons/fa";
import "../styles/Accomodation.css"; 
import { ACCESS_TOKEN } from "../constants";

function Accommodation() {
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN)
  const isLoggedIn = !!token; 

  const handleSelection = (option) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate(`/search?type=${option}`); // Pass type in query params
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    navigate("/login");
  };

  return (
    <div className="accommodation-container">
      <div className="navbar">
        <h1 className="title">ProxiStay</h1>
        {isLoggedIn ? (
          <button className="login-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login / Register
          </button>
        )}
      </div>

      <div className="options-container">
        <button className="option-btn" onClick={() => handleSelection("PG")}>
          <FaBuilding size={28} /> <span>PGs</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Apartment")}>
          <FaHome size={28} /> <span>Apartments</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Hostel")}>
          <FaBed size={28} /> <span>Hostels</span>
        </button>
        <button className="option-btn" onClick={() => handleSelection("Shared Room")}>
          <FaUsers size={28} /> <span>Shared Rooms</span>
        </button>
      </div>
    </div>
  );
}

export default Accommodation;
