import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-eco-100 text-eco-600 flex items-center justify-center mx-auto">
        <Recycle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
};
