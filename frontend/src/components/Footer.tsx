import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-eco-500 flex items-center justify-center text-white">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">WasteWise AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Empowering individuals and municipalities to eliminate contamination, properly sort recyclables,
              and track environmental sustainability using cutting-edge computer vision.
            </p>
            <p className="text-xs text-eco-400 font-semibold tracking-wide uppercase">
              Tagline: "Identify. Recycle. Sustain."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/scan" className="hover:text-white transition-colors">AI Waste Scanner</Link>
              </li>
              <li>
                <Link to="/centers" className="hover:text-white transition-colors">Recycling Centers Map</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Sustainability Dashboard</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">Scan Records</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Safety */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Materials</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Plastics (PET, HDPE)</li>
              <li>Paper & Cardboard</li>
              <li>Glass & Metal Cans</li>
              <li>E-Waste & Batteries</li>
              <li>Compost & Organics</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WasteWise AI. Built for environmental impact.</p>
          <div className="flex items-center gap-2">
            <span>Powered by PyTorch, FastAPI, React & Leaflet OpenStreetMap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
