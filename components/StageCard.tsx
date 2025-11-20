import React from 'react';
import { motion } from 'framer-motion';
import { DisplayData } from '../types';
import { CheckCircle2, Wrench, ArrowRight, Zap } from 'lucide-react';

interface StageCardProps {
  data: DisplayData | null;
}

export const StageCard: React.FC<StageCardProps> = ({ data }) => {
  if (!data) return (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 p-8 bg-white rounded-xl border border-slate-100 shadow-ali">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <ArrowRight className="text-slate-300" />
      </div>
      <p className="font-sans text-sm text-slate-400">点击上方流程节点 或 右侧进阶能力 查看详情</p>
    </div>
  );

  const isAdvanced = data.category === 'ADVANCED';

  return (
    <motion.div
      key={data.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white rounded-xl border border-slate-100 shadow-ali flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className={`p-3 rounded-lg border ${isAdvanced ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary-bg text-primary border-primary/10'}`}>
          <data.icon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-main font-sans">{data.title}</h2>
          <p className="text-text-secondary text-sm">{data.description}</p>
        </div>
        <div className={`ml-auto text-3xl font-hand select-none font-bold ${isAdvanced ? 'text-secondary/20' : 'text-slate-100'}`}>
          {data.tag}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-10 flex-1 overflow-y-auto flex flex-col gap-6">
        
        {/* Section 1: Function */}
        <div>
          <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2 uppercase tracking-wider">
            <span className={`w-1 h-4 rounded-full ${isAdvanced ? 'bg-secondary' : 'bg-primary'}`}></span>
            {isAdvanced ? '技术原理' : '核心逻辑'}
          </h3>
          <div className="text-text-secondary text-sm leading-relaxed font-sans pl-3 border-l-2 border-slate-100">
            {data.details.function}
          </div>
        </div>

        {/* Section 2: Breakdown (Grid) */}
        <div>
           <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2 uppercase tracking-wider">
             <span className={`w-1 h-4 rounded-full ${isAdvanced ? 'bg-primary' : 'bg-secondary'}`}></span>
             {isAdvanced ? '关键技术点' : '包含组件'}
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {data.details.includes.map((item, idx) => (
               <div key={idx} className="flex items-center gap-2 text-sm text-text-main bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                 <CheckCircle2 size={14} className="text-success flex-none" />
                 <span className="truncate">{item}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Section 3: Example */}
        <div className={`rounded-lg p-4 border border-dashed relative group ${isAdvanced ? 'bg-secondary/5 border-secondary/20' : 'bg-primary-bg/30 border-primary/20'}`}>
           <div className={`absolute -top-2 -left-2 px-2 text-xs font-hand font-bold border rounded transform -rotate-3 bg-white ${isAdvanced ? 'text-secondary border-secondary/20' : 'text-primary border-primary/20'}`}>
             Scene Example
           </div>
           <p className="font-hand text-text-main text-sm mt-1">
             "{data.details.example}"
           </p>
        </div>

        {/* Section 4: Tools */}
        <div className="mt-auto pt-4">
           <h3 className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2">
             <Wrench size={12} />
             RECOMMENDED STACK
           </h3>
           <div className="flex flex-wrap gap-2">
             {data.details.tools.map((tool, idx) => (
               <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 text-text-secondary text-xs border border-slate-200 font-medium">
                 {tool}
               </span>
             ))}
           </div>
        </div>

      </div>
    </motion.div>
  );
};