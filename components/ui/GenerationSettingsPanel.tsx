
import React from 'react';
import { Settings } from 'lucide-react';
import { RESOLUTIONS, COUNTS } from '../../constants';
import { GenConfig } from '../../types';

export const GenerationSettingsPanel = ({ config, onChange, isPoseSelectionActive }: { config: GenConfig, onChange: (c: GenConfig) => void, isPoseSelectionActive: boolean }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
        <Settings className="w-4 h-4" /> Cấu hình Sinh Ảnh
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Chất lượng</label>
          <div className="flex rounded border border-gray-200 overflow-hidden">
            {RESOLUTIONS.map(res => (
              <button
                key={res}
                onClick={() => onChange({...config, resolution: res as any})}
                className={`flex-1 text-xs py-2 ${config.resolution === res ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
        <div>
           <label className="block text-xs font-semibold text-gray-500 mb-1">Số lượng</label>
           <select 
             value={config.count} 
             onChange={(e) => onChange({...config, count: parseInt(e.target.value)})}
             disabled={isPoseSelectionActive}
             className="w-full text-xs py-2 px-2 border border-gray-200 rounded outline-none bg-white text-black disabled:bg-gray-100 disabled:text-gray-400"
           >
             {COUNTS.map(c => <option key={c} value={c}>{c} ảnh</option>)}
           </select>
        </div>
      </div>
    </div>
  );
};
