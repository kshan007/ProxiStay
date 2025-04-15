import React from "react";
import { useParams } from "react-router-dom";
import "../styles/Home.css";

const AccommodationDetails = () => {
  const { id } = useParams();
  
  const storedAccommodations = JSON.parse(localStorage.getItem("accommodations")) || [];
  const accommodation = storedAccommodations.find((acc) => acc.id.toString() === id);

  if (!accommodation) {
    return <h2>Accommodation not found.</h2>;
  }

  return (
    <div className="accommodation-details">
      <h2>{accommodation.name}</h2>
      <p className="card-price">₹{accommodation.budget}/month</p>
      <p className="card-location">
        Location: Lat {accommodation.latitude}, Lon {accommodation.longitude}
      </p>
      <h3>Amenities:</h3>
      <ul>
        {accommodation.amenities.map((amenity, index) => (
          <li key={index}>{amenity}</li>
        ))}
      </ul>
    </div>
  );
};

export default AccommodationDetails;
