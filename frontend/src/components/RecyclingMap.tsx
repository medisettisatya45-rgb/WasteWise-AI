import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RecyclingCenter } from '../types';
import { MapPin, Phone, Globe, Clock, Navigation, Search, Filter } from 'lucide-react';

// Fix Leaflet's default marker icons in React Vite
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically re-center map when centers change
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface RecyclingMapProps {
  centers: RecyclingCenter[];
  selectedCenter: RecyclingCenter | null;
  onSelectCenter: (center: RecyclingCenter) => void;
  userCoords: [number, number] | null;
}

export const RecyclingMap: React.FC<RecyclingMapProps> = ({
  centers,
  selectedCenter,
  onSelectCenter,
  userCoords
}) => {
  const defaultCenter: [number, number] = userCoords || (centers.length > 0 ? [centers[0].latitude, centers[0].longitude] : [17.3850, 78.4867]);
  const activePosition: [number, number] = selectedCenter ? [selectedCenter.latitude, selectedCenter.longitude] : defaultCenter;

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={activePosition}
        zoom={selectedCenter ? 14 : 12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapRecenter center={activePosition} zoom={selectedCenter ? 14 : 12} />
        
        {/* Free OpenStreetMap Tile Layer - No Paid APIs */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location pin if available */}
        {userCoords && (
          <Marker position={userCoords} icon={customMarkerIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-800">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Center Pins */}
        {centers.map((c) => (
          <Marker
            key={c.id}
            position={[c.latitude, c.longitude]}
            icon={customMarkerIcon}
            eventHandlers={{
              click: () => onSelectCenter(c),
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 max-w-[220px]">
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{c.name}</h4>
                <p className="text-[11px] text-slate-500">{c.address}, {c.city}</p>
                {c.distance_km !== null && c.distance_km !== undefined && (
                  <p className="text-[11px] font-bold text-eco-600">
                    📍 {c.distance_km} km away
                  </p>
                )}
                <div className="pt-1 flex flex-wrap gap-1">
                  {c.accepted_materials.slice(0, 3).map((m, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {m}
                    </span>
                  ))}
                  {c.accepted_materials.length > 3 && (
                    <span className="text-[9px] text-slate-400">+{c.accepted_materials.length - 3}</span>
                  )}
                </div>
                <div className="pt-2">
                  <a
                    href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords ? userCoords[0] + '%2C' + userCoords[1] : ''}%3B${c.latitude}%2C${c.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-eco-600 hover:text-eco-800"
                  >
                    <Navigation className="w-3 h-3" />
                    Open Route in OSM
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
