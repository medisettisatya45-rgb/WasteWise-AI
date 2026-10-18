import React, { useState } from 'react';
import { WasteScanner } from '../components/WasteScanner';
import { ScanResultCard } from '../components/ScanResultCard';
import { scanService } from '../services/scanService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { WastePrediction, WasteScan } from '../types';
import { Sparkles, Camera, MapPin, History, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ScanPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<WastePrediction | WasteScan | null>(null);

  const handleScan = async (file: File, notes?: string) => {
    setIsLoading(true);
    try {
      if (user) {
        // Authenticated: run full classification, persist to database, update user stats
        const result = await scanService.uploadAndSaveScan(file, notes);
        setScanResult(result);
        await refreshUser();
        await refreshNotifications();
      } else {
        // Guest: classify in memory
        const prediction = await scanService.classifyImage(file);
        setScanResult(prediction);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (isCorrect: boolean) => {
    if (scanResult && 'id' in scanResult) {
      await scanService.submitFeedback(scanResult.id, isCorrect);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-100 text-eco-800 text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5" />
          AI Computer Vision Scanner
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Scan & Segregate Waste
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Capture or upload waste packaging to receive instant material identification, recyclable status, and disposal instructions.
        </p>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Scanning as a guest. Sign in to save scans to your profile, earn badges, and track carbon metrics.</span>
          </div>
          <Link to="/login" className="font-extrabold text-sky-700 hover:text-sky-900 underline whitespace-nowrap ml-2">
            Sign In
          </Link>
        </div>
      )}

      {/* Main Grid: Scanner + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Scanner Input */}
        <div>
          <WasteScanner onScan={handleScan} isLoading={isLoading} />
        </div>

        {/* Right: Scan Results */}
        <div>
          {scanResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-eco-600" />
                  AI Classification Result
                </h3>
                {user && (
                  <Link
                    to="/history"
                    className="text-xs font-bold text-eco-600 hover:text-eco-700 flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    View History
                  </Link>
                )}
              </div>
              <ScanResultCard result={scanResult} onFeedback={user ? handleFeedback : undefined} />
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-300 shadow-xs border border-slate-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="font-bold text-base text-slate-600">No Waste Item Scanned Yet</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Upload a photo or select a quick sample item on the left to view real-time recycling recommendations and bin instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
