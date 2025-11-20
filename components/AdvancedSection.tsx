import React from 'react';
import { DisplayData } from '../types';

interface AdvancedSectionProps {
  features: DisplayData[];
  selectedId: string | null;
  onSelect: (feature: DisplayData) => void;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({ features, selectedId, onSelect }) => {
  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-100 shadow-ali overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-md font-bold text-text-main font-sans">PRO 进阶能力</h2>
        <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">PRODUCTION</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-10">
        <div className="grid grid-cols-1 gap-3">
          {features.map((feature) => {
            const isSelected = selectedId === feature.id;
            return (
              <div 
                key={feature.id} 
                onClick={() => onSelect(feature)}
                className={`
                  group p-3 rounded-lg border transition-all cursor-pointer
                  ${isSelected 
                    ? 'border-secondary bg-secondary/5 shadow-sm' 
                    : 'border-slate-100 hover:border-secondary/30 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    mt-1 p-1.5 rounded transition-colors
                    ${isSelected ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 group-hover:text-secondary group-hover:bg-white'}
                  `}>
                    <feature.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${isSelected ? 'text-secondary' : 'text-text-main'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-xs text-text-secondary mb-2 line-clamp-1">{feature.description}</p>
                    <div className="flex gap-2 flex-wrap">
                       {feature.details.includes.slice(0, 2).map((item, i) => (
                         <span key={i} className={`text-[10px] px-1.5 rounded border ${isSelected ? 'bg-white border-secondary/20 text-secondary' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                           {item}
                         </span>
                       ))}
                       {feature.details.includes.length > 2 && (
                         <span className="text-[10px] text-slate-300">+ {feature.details.includes.length - 2}</span>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
         <p className="text-[10px] text-text-tertiary font-hand">Enterprise Grade Architecture</p>
      </div>
    </div>
  );
};