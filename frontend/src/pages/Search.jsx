import React, { useState, useEffect } from "react";
import { Link, useLocation as useRouterLocation } from "react-router-dom";
import api from "../api";
import "../styles/search.css";
import { ACCESS_TOKEN } from "../constants";

import Select from "react-select";

// Abort signal that fires after `ms` (works in all modern browsers).
const timeoutSignal = (ms) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

// Geocode with Nominatim first, fall back to Photon if it fails or is blocked.
const geocodeLocation = async (query) => {
  const q = encodeURIComponent(query);

  try {
    const res = await api.get(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`,
      { signal: timeoutSignal(10000) }
    );
    const hit = res.data?.[0];
    if (hit) return { lat: hit.lat, lon: hit.lon };
  } catch (err) {
    console.warn("Nominatim geocoding failed, trying Photon:", err?.message || err);
  }

  try {
    const res = await api.get(
      `https://photon.komoot.io/api/?limit=1&q=${q}`,
      { signal: timeoutSignal(10000) }
    );
    const coords = res.data?.features?.[0]?.geometry?.coordinates;
    if (coords) return { lat: coords[1], lon: coords[0] };
  } catch (err) {
    console.warn("Photon geocoding failed:", err?.message || err);
  }

  return null;
};

// Overpass mirrors raced in parallel: the canonical server (overpass-api.de)
// is frequently WAF-blocked or rate-limited, and mirrors vary wildly in speed
// depending on query size, so the first valid response wins.
const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const queryOverpass = async (query) => {
  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint) => {
    const response = await fetch(endpoint, {
      method: "POST",
      body: query,
      signal: timeoutSignal(30000),
    });

    if (!response.ok) {
      throw new Error(`${endpoint} responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data?.elements)) {
      throw new Error(`${endpoint} returned an unexpected payload`);
    }
    return data;
  });

  try {
    return await Promise.any(attempts);
  } catch (err) {
    const reasons = (err?.errors || [])
      .map((e) => e?.message || String(e))
      .join("; ");
    console.warn("All Overpass mirrors failed:", reasons);
    throw new Error(`no Overpass server reachable (${reasons || "unknown error"})`);
  }
};

const Search = () => {
  const [location, setLocation] = useState("");
  const [minbudget, setMinBudget] = useState(null);
  const [maxbudget, setMaxBudget] = useState(null);
  const [amenity, setAmenity] = useState([]); // Changed to array for multiple selection
  const [type, setType] = useState("");
  const [proximity, setProximity] = useState(15);
  const [accommodations, setAccommodations] = useState([]);
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
      const query = location || type;
      if (!query) {
        alert("Please enter a college name or select a type.");
        return;
      }

      const coords = await geocodeLocation(query);
      if (!coords) {
        alert("Location not found. Try again!");
        return;
      }

      const { lat, lon } = coords;
      const token = localStorage.getItem(ACCESS_TOKEN);

      // Step 1: Fetch accommodations from Overpass API
      const overpassType = type.toLowerCase() || "hostel"; // fallback to 'hostel' if no type selected

        let overpassQuery = `
          [out:json];
          (
        `;

        if (!type || overpassType === "hostel") {
          overpassQuery += `node(around:${proximity * 1000}, ${lat}, ${lon})["tourism"="hostel"];`;
        }

        if (!type || overpassType === "apartment") {
          overpassQuery += `node(around:${proximity * 1000}, ${lat}, ${lon})["building"="apartments"];`;
        }

        if (!type || overpassType === "pg") {
          overpassQuery += `node(around:${proximity * 1000}, ${lat}, ${lon})["amenity"="lodging"];`;
          overpassQuery += `node(around:${proximity * 1000}, ${lat}, ${lon})["building"="dormitory"];`;
        }

        if (!type || overpassType === "shared room") {
          overpassQuery += `node(around:${proximity * 1000}, ${lat}, ${lon})["building"="residential"];`;
        }

        overpassQuery += `
          );
          out body;
        `;

      
      const overpassData = await queryOverpass(overpassQuery);
      const nodes = overpassData.elements;

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
          budget: 5000 + (i % 5) * 2000,
          type: node.tags.tourism,
          phone: node.tags.phone || "",
          website: node.tags.website || ""
        };
      });

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
      console.error("Accommodation search failed:", error);
      const reason = error?.message ? ` Reason: ${error.message}` : "";
      alert(`Failed to fetch accommodations. Please try again.${reason}`);
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
              <div key={acc.id} className="accommodation-card">
                <div className="card-header">
                <Link to="/profile" state={{ accommodationName: acc.name }} className="card-name">
                  <h3 >{acc.name}</h3>
                  </Link>
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
                    <p>Amenities:
                    {acc.amenities.map((a, index) => (
                      <span key={index} className="option-tag">{a}</span>
                    ))}
                    </p>
                  </div>
                </div>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
