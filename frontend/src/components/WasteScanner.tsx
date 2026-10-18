import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface WasteScannerProps {
  onScan: (file: File, notes?: string) => Promise<void>;
  isLoading: boolean;
}

// Sample waste items to allow instant one-click testing
const SAMPLE_TEST_ITEMS = [
  {
    name: 'Plastic PET Water Bottle',
    category: 'Plastic',
    filename: 'plastic_water_bottle.jpg',
    color: '#0284c7', // Sky Blue
  },
  {
    name: 'Cardboard Delivery Box',
    category: 'Paper & Cardboard',
    filename: 'corrugated_cardboard_box.jpg',
    color: '#d97706', // Amber
  },
  {
    name: 'Aluminum Soda Can',
    category: 'Metal',
    filename: 'aluminum_soda_can.jpg',
    color: '#6366f1', // Indigo
  },
  {
    name: 'Glass Beverage Jar',
    category: 'Glass',
    filename: 'glass_preserve_jar.jpg',
    color: '#0d9488', // Teal
  },
  {
    name: 'Apple Core & Food Scraps',
    category: 'Organic / Compost',
    filename: 'organic_food_apple_peels.jpg',
    color: '#16a34a', // Green
  },
  {
    name: 'Discarded AA Battery & PCB',
    category: 'E-Waste',
    filename: 'battery_electronic_ewaste.jpg',
    color: '#9333ea', // Purple
  }
];

export const WasteScanner: React.FC<WasteScannerProps> = ({ onScan, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 10 MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Helper to generate a realistic canvas test image for demo items
  const handleSelectSample = (sample: typeof SAMPLE_TEST_ITEMS[0]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = sample.color;
      ctx.fillRect(0, 0, 300, 300);

      // Draw subtle item silhouette
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(150, 150, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sample.category, 150, 155);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], sample.filename, { type: 'image/jpeg' });
          handleFileSelect(file);
        }
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select or capture an image first.');
      return;
    }
    setErrorMsg(null);
    try {
      await onScan(selectedFile, notes);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to scan image. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setNotes('');
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Upload Zone */}
        {!previewUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? 'border-eco-500 bg-eco-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-eco-100 text-eco-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Scan or Upload Waste Image
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Take a snapshot with your camera or drag & drop a photo of waste packaging, bottles, or boxes.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* Native file upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                Browse File
              </button>

              {/* Camera capture button */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-eco-600 hover:bg-eco-700 shadow-sm shadow-eco-600/30 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-80 flex items-center justify-center border border-slate-200">
              <img
                src={previewUrl}
                alt="Selected waste preview"
                className="max-h-full max-w-full object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <div className="relative w-16 h-16 mb-3">
                    <div className="absolute inset-0 border-4 border-eco-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-eco-400 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-eco-300 animate-pulse" />
                  </div>
                  <p className="font-bold text-base tracking-wide">AI Analyzing Visual Features...</p>
                  <p className="text-xs text-eco-200 mt-1">Classifying materials & sorting rules</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-xs">{selectedFile?.name}</span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes / Item Context (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Unwashed yogurt container from lunch"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Action Button */}
        {previewUrl && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-white bg-eco-600 hover:bg-eco-700 disabled:opacity-50 shadow-md shadow-eco-600/30 transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processing Waste Classification...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Classify & Get Disposal Instructions
              </>
            )}
          </button>
        )}
      </form>

      {/* Demo Test Item Selector */}
      {!previewUrl && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-eco-600" />
            Quick Test with Real Waste Samples:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SAMPLE_TEST_ITEMS.map((item) => (
              <button
                key={item.filename}
                type="button"
                onClick={() => handleSelectSample(item)}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-eco-500 bg-slate-50/50 hover:bg-eco-50/30 transition-all text-xs group"
              >
                <div className="font-bold text-slate-800 group-hover:text-eco-700 truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {item.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
