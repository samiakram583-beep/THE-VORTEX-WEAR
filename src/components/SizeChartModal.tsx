import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SizeChartModalProps {
  categorySlug?: string;
  onClose: () => void;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ categorySlug = 'shirts', onClose }) => {
  const [activeTab, setActiveTab] = useState<'shirts' | 'pants'>(
    categorySlug.toLowerCase().includes('pant') ? 'pants' : 'shirts'
  );
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-display">Size & Fit Guide</h3>
            <p className="text-xs text-stone-500 mt-0.5">Measurements tailored for standard The Vortex Wear relaxed & tailored cuts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Unit toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-6">
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setActiveTab('shirts')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'shirts' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Shirts & Overshirts
            </button>
            <button
              onClick={() => setActiveTab('pants')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'pants' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Trousers & Cargo Pants
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                unit === 'inches' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                unit === 'cm' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          {activeTab === 'shirts' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Length</th>
                  <th className="py-3 px-4">Shoulder</th>
                  <th className="py-3 px-4">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">S</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '28"' : '71.1 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '18"' : '45.7 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '24"' : '61.0 cm'}</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="py-3 px-4 font-semibold text-stone-900">M</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '42"' : '106.7 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '29"' : '73.6 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '19"' : '48.3 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '25"' : '63.5 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">L</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '44"' : '111.8 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '30"' : '76.2 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '20"' : '50.8 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '26"' : '66.0 cm'}</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="py-3 px-4 font-semibold text-stone-900">XL</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '46"' : '116.8 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '31"' : '78.7 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '21"' : '53.3 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '26.5"' : '67.3 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">XXL</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '48"' : '121.9 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '32"' : '81.3 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '22"' : '55.9 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '27"' : '68.6 cm'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Hip</th>
                  <th className="py-3 px-4">Inseam</th>
                  <th className="py-3 px-4">Thigh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">S (30-31)</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '30-31"' : '76-78 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '30"' : '76.2 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '24"' : '61.0 cm'}</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="py-3 px-4 font-semibold text-stone-900">M (32-33)</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '32-33"' : '81-84 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '42"' : '106.7 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '31"' : '78.7 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '25"' : '63.5 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-stone-900">L (34-35)</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '34-35"' : '86-89 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '44"' : '111.8 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '31.5"' : '80.0 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '26"' : '66.0 cm'}</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="py-3 px-4 font-semibold text-stone-900">XL (36-38)</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '36-38"' : '91-96 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '46"' : '116.8 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '32"' : '81.3 cm'}</td>
                  <td className="py-3 px-4 text-stone-600">{unit === 'inches' ? '27"' : '68.6 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 p-3.5 bg-stone-50 rounded-lg text-xs text-stone-600 space-y-1">
          <p className="font-semibold text-stone-900">Fit Advice:</p>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-stone-900 shrink-0" />
            <span>If you prefer a relaxed or slightly oversized streetwear drape, select your regular size.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-stone-900 shrink-0" />
            <span>Trousers feature internal drawstrings providing flexibility across half-sizes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
