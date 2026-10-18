import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { centerService } from '../services/centerService';
import { RecyclingCenter } from '../types';
import { RecyclingMap } from '../components/RecyclingMap';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  Filter, 
  Star, 
  Compass, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const RecyclingCentersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMaterial = searchParams.get('material') || '';

  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(initialMaterial);
  const [search, setSearch] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  const materials = [
    'All',
    'Plastic',
    'Paper & Cardboard',
    'Glass',
    'Metal',
    'Organic / Compost',
    'E-Waste',
    'Hazardous'
  ];

  const fetchCenters = async () => {
    setIsLoading(true);
    try {
      const data = await centerService.getNearbyCenters({
        lat: userCoords ? userCoords[0] : undefined,
        lng: userCoords ? userCoords[1] : undefined,
        radius_km: radiusKm,
        material: selectedMaterial !== 'All' ? selectedMaterial : undefined,
        search: search || undefined
      });
      setCenters(data);
      if (data.length > 0 && !selectedCenter) {
        setSelectedCenter(data[0]);
      }
    } catch (err) {
      console.error('Failed to load recycling centers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [userCoords, radiusKm, selectedMaterial]);

  // Request browser location
  const handleLocateMe = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setGeoError('Could not retrieve your location. Showing default city centers.');
      }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCenters();
  };

  return (
    <div className="py-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nearby Recycling Centers & Depots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Locate certified facilities accepting plastics, metals, glass, e-waste, and hazardous materials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-eco-800 bg-eco-100 hover:bg-eco-200 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Compass className="w-4 h-4 text-eco-600" />
          {userCoords ? 'Location Active' : 'Use My Location'}
        </button>
      </div>

      {geoError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Filter Material:
          </span>
          {materials.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMaterial(m)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedMaterial === m || (m === 'All' && !selectedMaterial)
                  ? 'bg-eco-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search & Radius row */}
        <form onSubmit={handleSearchSubmit} className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search center name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Radius:</span>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="accent-eco-600 w-24"
            />
            <span className="font-bold text-slate-800">{radiusKm} km</span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Main Layout: Interactive Map + Centers List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: OpenStreetMap Map */}
        <div className="lg:col-span-7">
          <RecyclingMap
            centers={centers}
            selectedCenter={selectedCenter}
            onSelectCenter={(c) => setSelectedCenter(c)}
            userCoords={userCoords}
          />
        </div>

        {/* Right: Centers Cards */}
        <div className="lg:col-span-5 space-y-3 max-h-[450px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading nearby facilities...
            </div>
          ) : centers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No centers found</p>
              <p>Try widening your search radius or changing the material filter.</p>
            </div>
          ) : (
            centers.map((center) => (
              <div
                key={center.id}
                onClick={() => setSelectedCenter(center)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedCenter?.id === center.id
                    ? 'bg-eco-50/70 border-eco-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-black text-sm text-slate-900 leading-tight">
                    {center.name}
                  </h4>
                  {center.distance_km !== null && center.distance_km !== undefined && (
                    <span className="text-xs font-black text-eco-600 shrink-0">
                      {center.distance_km} km
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{center.address}, {center.city}</span>
                </p>

                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {center.operating_hours.split(',')[0]}
                  </span>
                  {center.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {center.phone}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {center.accepted_materials.slice(0, 3).map((m, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {m}
                      </span>
                    ))}
                    {center.accepted_materials.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{center.accepted_materials.length - 3}
                      </span>
                    )}
                  </div>

                  <a
                    href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords ? userCoords[0] + '%2C' + userCoords[1] : ''}%3B${center.latitude}%2C${center.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-eco-600 hover:text-eco-800"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
