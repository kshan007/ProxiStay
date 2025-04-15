import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import api from "../api";
import "../styles/search.css";
import { ACCESS_TOKEN } from "../constants";

import Select from "react-select";

const Search = () => {
  const [location, setLocation] = useState("");
  const [minbudget, setMinBudget] = useState(null);
  const [maxbudget, setMaxBudget] = useState(null);
  const [amenity, setAmenity] = useState([]); // Changed to array for multiple selection
  const [type, setType] = useState("");
  const [proximity, setProximity] = useState(15);
  const [accommodations, setAccommodations] = useState([]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(routerLocation.search);
    const accommodationType = queryParams.get("type");
    if (accommodationType) {
      setType(accommodationType);
    }
  }, [routerLocation]);

  const fetchAccommodations = async () => {
    try {
      const geoResponse = await api.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location || type}`
      );

      if (geoResponse.data.length === 0) {
        alert("Location not found. Try again!");
        return;
      }

      const { lat, lon } = geoResponse.data[0];
      const token = localStorage.getItem(ACCESS_TOKEN);

      // Step 1: Fetch accommodations from Overpass API
      const overpassType = type.toLowerCase() || "hostel"; // fallback to 'hostel' if no type selected

      const overpassQuery = `
        [out:json];
        (
          node["tourism"="${overpassType}"]
            (around:${proximity*1000},${lat},${lon});
        );
        out body;
      `;
      
      const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });

      const overpassData = await overpassResponse.json();
      const nodes = overpassData.elements || [];

      const allAmenities = [
        "Food",
        "WiFi",
        "Parking",
        "AC",
        "Laundry",
        "Gym",
        "TV",
        "CCTV",
        "Water",
        "Power Backup",
        "Furnished"
      ];

      const rawAccommodations = nodes.map((node, i) => {
        // Get 2 to 5 random amenities
        const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
        const randomAmenities = shuffled.slice(0, Math.floor(Math.random() * 4) + 2);
      
        return {
          id: node.id,
          name: node.tags.name || `Accommodation ${i + 1}`,
          lat: node.lat,
          lon: node.lon,
          amenities: randomAmenities,
          budget: 5000 + (i % 3) * 2000,
          type: node.tags.tourism,
          phone: node.tags.phone || "",
          website: node.tags.website || ""
        };
      });
      console.log(amenity)
      // Step 2: Send accommodations to backend for proximity filtering
      const response = await api.post(
        "/api/search/",
        {
          lat,
          lon,
          minbudget,
          maxbudget,
          proximity,
          amenities: amenity, // Sending selected amenities
          accommodations: rawAccommodations,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccommodations(response.data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    }
  };

  // Handle amenities selection (react-select)
  const handleAmenityChange = (selectedOptions) => {
    setAmenity(selectedOptions.map((option) => option.value));
  };

  return (
    <div className="search-container">
      <h2>Find Accommodation Near Your College</h2>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Enter College Name..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        
        <select className="filter-select" onChange={(e) => { const [min, max] = e.target.value.split("-").map(Number); setMinBudget(min); setMaxBudget(max); }}>
          <option value="">Select Budget</option>
          <option value="5000-8000">₹5,000 - ₹8,000</option>
          <option value="8000-12000">₹8,000 - ₹12,000</option>
          <option value="12000-15000">₹12,000 - ₹15,000</option>
        </select>

        <label style={{ fontWeight: "bold", marginTop: "10px" }}>
          Select Amenities:
        </label>
        <Select
          isMulti
          name="amenities"
          options={[
            { value: "Food", label: "Food" },
            { value: "Furnished", label: "Furnished House" },
            { value: "Laundry", label: "Laundry" },
            { value: "WiFi", label: "WiFi" },
            { value: "Parking", label: "Parking" },
            { value: "Water", label: "Water" },
            { value: "Power Backup", label: "Power Backup" },
            { value: "AC", label: "AC" },
          ]}
          className="basic-multi-select"
          classNamePrefix="select"
          value={amenity.map((a) => ({ value: a, label : a }))}
          onChange={handleAmenityChange}
        />

        <label style={{ fontWeight: "bold", marginTop: "10px" }}>
          Proximity: {proximity} km
        </label>
        <input
          type="range"
          min="5"
          max="15"
          step="1"
          value={proximity}
          onChange={(e) => setProximity(e.target.value)}
          className="slider"
        />

        <button className="search-btn" onClick={fetchAccommodations}>
          Search
        </button>
      </div>

      {/* Results */}
      <div className="accommodations-container">
        <div className="accommodations-scroll">
          {accommodations.length === 0 ? (
            <p>No accommodations found.</p>
          ) : (
            accommodations.map((acc) => (
              <Link to="/profile" state={{ accommodationName: acc.name }} key={acc.id} className="accommodation-card">
                <div className="card-header">
                  <h3 className="card-name">{acc.name}</h3>
                </div>
                <div className="card-content">
                  <p className="card-price">₹{acc.budget}/month</p>
                  <p>Phone: {acc.phone || 'None'}</p>
                  {acc.website && <p>Website: <a href={acc.website}>{acc.website || 'None'}</a></p>}
                  <p>
                    Location:{" "}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps?q=${acc.lat},${acc.lon}`, "_blank");
                      }}
                      style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                    >
                      View on Map
                    </span>
                  </p>

                  <div className="card-options">
                    <p>Amenities :
                    {acc.amenities.map((a, index) => (
                      <span key={index} className="option-tag">{a}</span>
                    ))}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
