import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ onLocationChange }) => {
  const [position, setPosition] = useState([13.0827, 80.2707]); // Default (Chennai)

  const handleMapClick = (e) => {
    const newPos = [e.latlng.lat, e.latlng.lng];
    setPosition(newPos);
    onLocationChange({ lat: newPos[0], lng: newPos[1] });
  };

  return (
    <MapContainer
      center={position}
      zoom={12}
      style={{ height: "400px", width: "100%" }}
      onClick={handleMapClick}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
