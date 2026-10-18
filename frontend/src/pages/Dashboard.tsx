import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/statsService';
import { DashboardStats } from '../types';
import { SustainabilityScoreCard } from '../components/SustainabilityScoreCard';
import { StatsCharts } from '../components/StatsCharts';
import { 
  Camera, 
  Recycle, 
  Scale, 
  Leaf, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Environmental Metrics...</p>
      </div>
    );
  }

  const { sustainability, category_breakdown, monthly_trends, weekly_activity, recommendations } = stats;

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.full_name || 'Eco Advocate'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Here is your real-time waste diversion impact and sustainability score overview.
          </p>
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-eco-600 hover:bg-eco-700 shadow-sm shadow-eco-600/30 transition-all self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          Scan New Item
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scanned</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{sustainability.total_scans}</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {sustainability.recycled_count} items sorted into recycling
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recycling Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{sustainability.recycling_rate}%</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Proportion diverted from landfill
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diverted Weight</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{sustainability.diverted_weight_kg} kg</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Physical packaging reclaimed
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-eco-100 text-eco-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Offset</p>
            <p className="text-2xl font-black text-eco-600 mt-0.5">{sustainability.carbon_saved_kg} kg</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            CO2 equivalent emissions saved
          </p>
        </div>
      </div>

      {/* Sustainability Score & Level Progress */}
      <SustainabilityScoreCard sustainability={sustainability} />

      {/* Visual Analytics / Recharts */}
      <StatsCharts
        categories={category_breakdown}
        monthlyTrends={monthly_trends}
        weeklyActivity={weekly_activity}
      />

      {/* Personalized Recommendations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Tailored Eco Recommendations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Habit adjustments and circular alternatives based on your recent waste scan profile
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-eco-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                  {rec.category}
                </span>
                <span className="text-xs font-extrabold text-eco-700 bg-eco-100 px-2 py-0.5 rounded-full">
                  {rec.estimated_saving}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
