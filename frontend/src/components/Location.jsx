import React, { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const AccommodationListing = () => {
  const [location, setLocation] = useState({ lat: 13.0827, lng: 80.2707 });
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    fetchAccommodations();
  }, [location]);

  const fetchAccommodations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/accommodations/?lat=${location.lat}&lng=${location.lng}`
      );
      const data = await response.json();
      setAccommodations(data);
    } catch {
      setAccommodations([]);
    }
  };

  return (
    <div className="accommodation-container">
      <MapComponent onLocationChange={setLocation} />
      <div className="accommodations-container">
        {accommodations.map((acc) => (
          <div key={acc.id} className="accommodation-card">
            <img src={acc.image} alt={acc.name} />
            <h3>{acc.name}</h3>
            <p>{acc.price}</p>
            <p>{acc.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccommodationListing;
