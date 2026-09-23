import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api";
import "../styles/results.css";
import { ACCESS_TOKEN } from "../constants";

const Results = () => {
  const location = useLocation();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchType = queryParams.get("type");
    const searchLocation = queryParams.get("location");
    const proximity = queryParams.get("proximity") || 15;

    const fetchData = async () => {
      try {
        // Step 1: Get coordinates for the location
        const geoResponse = await api.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchLocation}`
        );

        if (geoResponse.data.length === 0) {
          alert("Location not found. Try again!");
          setLoading(false);
          return;
        }

        const { lat, lon } = geoResponse.data[0];
        const token = localStorage.getItem(ACCESS_TOKEN);

        // Step 2: Send request to backend
        const response = await api.post("/api/search/", {
          lat,
          lon,
          type: searchType,
          proximity: parseInt(proximity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        setAccommodations(response.data);
      } catch {
        alert("Failed to load accommodations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  return (
    <div className="results-container">
      <h2>Accommodations near your college</h2>
      {loading ? (
        <p>Loading...</p>
      ) : accommodations.length === 0 ? (
        <p>No accommodations found within the selected proximity.</p>
      ) : (
        <div className="accommodations-scroll">
          {accommodations.map((acc) => (
            <Link to={`/accommodation/${acc.id}`} key={acc.id} className="accommodation-card">
              <div className="card-header">
                <h3 className="card-name">{acc.name}</h3>
              </div>
              <div className="card-content">
                <p className="card-price">₹{acc.budget}/month</p>
                <p>Distance: {acc.distance} km</p>
                {acc.phone && <p>Phone: {acc.phone}</p>}
                {acc.website && (
                  <p>
                    Website:{" "}
                    <a href={acc.website} target="_blank" rel="noopener noreferrer">
                      {acc.website}
                    </a>
                  </p>
                )}
                <div className="card-options">
                  {acc.amenities?.map((a, i) => (
                    <span key={i} className="option-tag">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
