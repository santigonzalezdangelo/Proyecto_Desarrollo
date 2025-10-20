// src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [32, 32],
});


export default function MapView({ lat, lng, title }) {
  if (!lat || !lng) return <p>No se pudo cargar el mapa</p>;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md w-full h-[300px] md:h-[400px]">
      <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
