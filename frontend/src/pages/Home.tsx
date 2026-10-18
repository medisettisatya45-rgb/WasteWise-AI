import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Recycle, 
  MapPin, 
  Award, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-16 shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-eco-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-eco-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-eco-400" />
            AI-Powered Waste Segregation & Circular Economy
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
            Identify. Recycle. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-400 to-emerald-300">
              Sustain.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Never guess which bin to use again. WasteWise AI combines cutting-edge computer vision with localized recycling rules to analyze waste packaging, guide proper disposal, locate certified drop-off centers, and track your carbon reduction footprint.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-extrabold text-white bg-eco-600 hover:bg-eco-700 shadow-lg shadow-eco-600/30 transition-all hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              Scan Waste Now
            </Link>

            <Link
              to="/centers"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-extrabold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              Find Drop-Off Centers
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-700/60 max-w-lg">
            <div>
              <p className="text-2xl font-black text-white">8</p>
              <p className="text-xs text-slate-400 font-medium">Material Classes</p>
            </div>
            <div>
              <p className="text-2xl font-black text-eco-400">&gt;94%</p>
              <p className="text-xs text-slate-400 font-medium">Sorting Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-300">100%</p>
              <p className="text-xs text-slate-400 font-medium">Free & Open Map</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How WasteWise AI Works
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Turn confusing recycling labels into simple, confident daily habits in three steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-5 font-black text-lg">
              1
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">1. Snap or Upload Photo</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Use your smartphone camera or upload a photo of any discarded bottle, wrapper, container, or electronic device.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-eco-100 text-eco-600 flex items-center justify-center mb-5 font-black text-lg">
              2
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">2. Instant AI Classification</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our neural vision model recognizes polymer grades, metals, fibers, or organics, displaying the correct bin color and preparation steps.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-black text-lg">
              3
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">3. Track Impact & Drop Off</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Log diverted carbon emissions, level up your Sustainability Score, and view nearby municipal recycling centers on our map.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-eco-600">Complete Sustainability Suite</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Designed for Real-World Environmental Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle className="w-6 h-6 text-eco-500" />
            <h4 className="font-extrabold text-base text-slate-900">Zero-Contamination Instructions</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detailed pre-sorting rules: rinse oils, crush plastic containers, remove adhesive tape, and preserve materials for circular remanufacturing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Globe className="w-6 h-6 text-sky-500" />
            <h4 className="font-extrabold text-base text-slate-900">OpenStreetMap Depots</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore municipal sorting centers and specialized electronic/hazardous drop-offs without reliance on paid map APIs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h4 className="font-extrabold text-base text-slate-900">Gamified Sustainability Score</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Progress from "Seedling" to "Earth Champion" by maintaining daily scanning streaks and saving verified kilograms of CO2 equivalent.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <h4 className="font-extrabold text-base text-slate-900">Secure Role-Based Access</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strict password UTF-8 byte boundary enforcement (&le; 72 bytes) and granular permissions for community users and administrators.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h4 className="font-extrabold text-base text-slate-900">Modular PyTorch Architecture</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Easily interchange weights or fine-tune neural architectures across specialized regional waste collections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            <h4 className="font-extrabold text-base text-slate-900">Personalized Eco Recommendations</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamic suggestions tailored directly to your frequent waste categories to systematically replace single-use items.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Ready to Make Every Scannable Item Count?
        </h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Join WasteWise AI today, start scanning household items, and see your personal carbon savings grow.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/scan"
            className="px-6 py-3 rounded-xl font-bold text-white bg-eco-600 hover:bg-eco-700 shadow-sm shadow-eco-600/30 transition-colors"
          >
            Start Scanning
          </Link>
          {!user && (
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
