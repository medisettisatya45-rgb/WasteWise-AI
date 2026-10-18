import React, { useEffect, useState } from 'react';
import { scanService } from '../services/scanService';
import { WasteScan } from '../types';
import { 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Calendar, 
  Camera, 
  Eye, 
  X, 
  Leaf 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ScanHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<WasteScan[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [recyclableFilter, setRecyclableFilter] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<WasteScan | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const isRecyclableParam = recyclableFilter === 'all' ? undefined : recyclableFilter === 'true';
      const data = await scanService.getHistory({
        category: categoryFilter || undefined,
        is_recyclable: isRecyclableParam,
        search: search || undefined,
        limit: 100
      });
      setScans(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchHistory();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, categoryFilter, recyclableFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this scan record?')) {
      await scanService.deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }
    }
  };

  return (
    <div className="py-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Waste Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Total of {total} items scanned and classified by your account
          </p>
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          New Scan
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search category, subcategory or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 placeholder:text-slate-400"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-eco-500/30"
        >
          <option value="">All Categories</option>
          <option value="Plastic">Plastic</option>
          <option value="Paper & Cardboard">Paper & Cardboard</option>
          <option value="Glass">Glass</option>
          <option value="Metal">Metal</option>
          <option value="Organic / Compost">Organic / Compost</option>
          <option value="E-Waste">E-Waste</option>
          <option value="Hazardous">Hazardous</option>
          <option value="Landfill / Residual">Landfill / Residual</option>
        </select>

        {/* Recyclability Filter */}
        <select
          value={recyclableFilter}
          onChange={(e) => setRecyclableFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-eco-500/30"
        >
          <option value="all">All Statuses</option>
          <option value="true">Recyclable Only</option>
          <option value="false">Non-Recyclable Only</option>
        </select>
      </div>

      {/* Scans Grid / List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-eco-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-400">Loading scan history...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">No Scans Found</h3>
          <p className="text-xs text-slate-500">
            {search || categoryFilter || recyclableFilter !== 'all'
              ? 'No scans match your current filter parameters.'
              : 'You have not scanned any waste items yet.'}
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 shadow-sm mt-2"
          >
            Scan Your First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    scan.is_recyclable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {scan.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {scan.subcategory || scan.category}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                    {scan.target_bin_color}
                  </p>
                  {scan.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-2 line-clamp-2">
                      "{scan.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-eco-600 font-extrabold">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>+{scan.estimated_carbon_saved_kg} kg CO2</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedScan(scan)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title="View Full Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(scan.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Scan Details #{selectedScan.id}
              </h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Category</span>
                <span className="font-extrabold text-slate-900">{selectedScan.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Subcategory</span>
                <span className="font-medium text-slate-700">{selectedScan.subcategory || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">AI Confidence</span>
                <span className="font-black text-eco-600">{Math.round(selectedScan.confidence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Recyclable Status</span>
                <span className={`font-bold ${selectedScan.is_recyclable ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedScan.is_recyclable ? 'Recyclable' : 'Non-Recyclable'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Target Bin</span>
                <span className="font-bold text-slate-900">{selectedScan.target_bin_color}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Carbon Saved</span>
                <span className="font-bold text-eco-600">+{selectedScan.estimated_carbon_saved_kg} kg CO2e</span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1.5">Disposal Guidance</p>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                  {selectedScan.disposal_instructions}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
