import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MapPin, 
  Leaf, 
  Scale, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Info, 
  Sparkles 
} from 'lucide-react';
import { WastePrediction, WasteScan } from '../types';

interface ScanResultCardProps {
  result: WastePrediction | WasteScan;
  onFeedback?: (isCorrect: boolean) => Promise<void>;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onFeedback }) => {
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackChoice, setFeedbackChoice] = useState<boolean | null>(null);

  const handleFeedbackClick = async (choice: boolean) => {
    if (!onFeedback || feedbackSent) return;
    try {
      await onFeedback(choice);
      setFeedbackChoice(choice);
      setFeedbackSent(true);
    } catch {
      // Ignored
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Plastic':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Paper & Cardboard':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Glass':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Metal':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Organic / Compost':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'E-Waste':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hazardous':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Preparation steps array (can be list or newline string)
  let steps: string[] = [];
  if (Array.isArray((result as any).preparation_steps)) {
    steps = (result as any).preparation_steps;
  } else if (typeof (result as any).preparation_steps === 'string') {
    steps = (result as any).preparation_steps.split('\n').filter(Boolean);
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      
      {/* Top Header: Recyclability Banner */}
      <div className={`p-4 rounded-2xl flex items-center justify-between border ${
        result.is_recyclable
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : 'bg-amber-50 text-amber-900 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {result.is_recyclable ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-base leading-tight">
              {result.is_recyclable ? '100% Recyclable Item' : 'Non-Recyclable / Special Handling'}
            </h4>
            <p className="text-xs opacity-90 font-medium">
              {result.is_recyclable
                ? 'Can be diverted and reprocessed in circular manufacturing'
                : 'Requires special municipal handling or general landfill bin'}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
          result.is_recyclable ? 'bg-emerald-200/60 text-emerald-800' : 'bg-amber-200/60 text-amber-800'
        }`}>
          {result.is_recyclable ? 'RECYCLE' : 'LANDFILL / SPECIAL'}
        </span>
      </div>

      {/* Classification Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Identified Category */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Identified Material
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-sm font-extrabold border ${getCategoryColor(result.category)}`}>
              {result.category}
            </span>
            {result.subcategory && (
              <span className="text-xs font-medium text-slate-600">
                ({result.subcategory})
              </span>
            )}
          </div>
          {result.material_composition && (
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Composition: {result.material_composition}
            </p>
          )}
        </div>

        {/* Confidence & Model Version */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI Confidence
            </p>
            <span className="text-sm font-black text-slate-800">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-eco-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(result.confidence * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center justify-between">
            <span>Model: {result.model_version}</span>
            <span className="text-eco-600 font-bold">Validated</span>
          </p>
        </div>
      </div>

      {/* Target Bin Indicator */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            Target Disposal Bin
          </p>
          <p className="text-base font-extrabold text-eco-400 mt-0.5">
            {result.target_bin_color}
          </p>
        </div>

        <Link
          to={`/centers?material=${encodeURIComponent(result.category)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <MapPin className="w-4 h-4 text-eco-400" />
          Find Drop-Off Depots
        </Link>
      </div>

      {/* Preparation Instructions */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-eco-600" />
            Step-by-Step Preparation Checklist
          </h4>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-full bg-eco-100 text-eco-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  {idx + 1}
                </span>
                <p className="font-medium pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environmental Impact Savings */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-eco-50 border border-eco-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-eco-600 text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-eco-800 font-bold uppercase tracking-wider">Carbon Diverted</p>
            <p className="text-sm font-black text-slate-900">
              +{result.estimated_carbon_saved_kg} kg CO2e
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Weight Saved</p>
            <p className="text-sm font-black text-slate-900">
              {result.estimated_weight_kg} kg
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {onFeedback && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Was this classification accurate?</span>
          {feedbackSent ? (
            <span className="font-bold text-eco-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Thank you for improving our model!
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFeedbackClick(true)}
                className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-eco-50 hover:text-eco-700 hover:border-eco-300 transition-colors flex items-center gap-1 font-semibold"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleFeedbackClick(false)}
                className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors flex items-center gap-1 font-semibold"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                No
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
