import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Binary, 
  Database, 
  Filter, 
  Brain, 
  Search,
  Sparkles
} from 'lucide-react';
import { RagStep } from '../types';

interface RagVisualizerProps {
  currentStep: RagStep;
  onStepClick: (step: RagStep) => void;
  selectedFeatureId: string | null;
}

// Configuration for the layout logic
const steps = [
  { id: RagStep.CHUNKING, label: "文档处理", sub: "Processing", icon: Scissors },
  { id: RagStep.EMBEDDING, label: "向量化", sub: "Embedding", icon: Binary },
  { id: RagStep.VECTOR_STORE, label: "向量库", sub: "Vector Store", icon: Database },
  { id: RagStep.RERANK, label: "重排序", sub: "Rerank", icon: Filter },
  { id: RagStep.GENERATION, label: "LLM生成", sub: "Generation", icon: Brain },
];

// Mapping of Advanced Features to their relevant pipeline steps
const featureHighlights: Record<string, RagStep[]> = {
  'HYBRID_SEARCH': [RagStep.VECTOR_STORE, RagStep.RERANK],
  'PROMPT_ORCHESTRATION': [RagStep.GENERATION],
  'DOC_OPS': [RagStep.CHUNKING, RagStep.EMBEDDING, RagStep.VECTOR_STORE],
  'AGENTIC_RAG': [RagStep.CHUNKING, RagStep.EMBEDDING, RagStep.VECTOR_STORE, RagStep.RERANK, RagStep.GENERATION]
};

export const RagVisualizer: React.FC<RagVisualizerProps> = ({ currentStep, onStepClick, selectedFeatureId }) => {
  
  const getStepStatus = (stepId: RagStep) => {
    // If an advanced feature is selected, we override normal flow status
    if (selectedFeatureId) {
      const relevantSteps = featureHighlights[selectedFeatureId] || [];
      if (relevantSteps.includes(stepId)) return 'feature-highlight';
      return 'dimmed';
    }

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    if (currentStep === stepId) return 'active';
    if (currentStep !== RagStep.IDLE && stepIndex < currentIndex) return 'completed';
    return 'pending';
  };

  const activeFeatureName = selectedFeatureId?.replace('_', ' ');

  return (
    <div className="w-full h-full flex flex-col font-hand select-none">
      {/* The Title in Hand-drawn style */}
      <div className="absolute top-4 left-6 opacity-30 pointer-events-none hidden xl:block">
        <h3 className="text-2xl -rotate-2 text-slate-400">RAG Pipeline Sketch</h3>
        <svg width="150" height="10" className="mt-1">
          <path d="M2,5 Q75,10 148,2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Active Feature Badge (Floating) */}
      <AnimatePresence>
        {selectedFeatureId && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-full"
          >
            <Sparkles size={16} className="animate-pulse" />
            <span className="font-sans font-semibold text-sm">Visualizing: {activeFeatureName}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Diagram Container */}
      <div className="flex-1 flex items-center justify-center relative px-4 py-6 overflow-x-auto">
        <div className="flex items-center gap-0 relative">
          
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            const isFeatureHighlight = status === 'feature-highlight';
            const isDimmed = status === 'dimmed';

            return (
              <React.Fragment key={step.id}>
                <div className="relative z-10 flex flex-col items-center gap-3 group">
                  
                  {/* Sketchy Box Node */}
                  <motion.div
                    onClick={() => onStepClick(step.id)}
                    whileHover={{ scale: isDimmed ? 1 : 1.05, rotate: isDimmed ? 0 : -1 }}
                    whileTap={{ scale: isDimmed ? 1 : 0.95 }}
                    animate={isFeatureHighlight ? { 
                      scale: [1, 1.05, 1],
                      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                    } : { scale: 1 }}
                    className={`
                      w-24 h-24 flex items-center justify-center bg-white cursor-pointer transition-all duration-500
                      sketchy-box relative
                      ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
                      ${isActive ? 'border-primary shadow-[4px_4px_0px_0px_rgba(22,119,255,0.2)]' : ''}
                      ${isFeatureHighlight ? 'border-secondary shadow-[0px_0px_15px_rgba(250,140,22,0.3)]' : ''}
                      ${!isActive && !isFeatureHighlight ? 'border-slate-300 hover:border-slate-400' : ''}
                    `}
                    style={{
                       borderWidth: (isActive || isFeatureHighlight) ? '3px' : '2px',
                       borderColor: isActive ? '#1677ff' : isFeatureHighlight ? '#fa8c16' : isCompleted ? '#52c41a' : '#d9d9d9',
                       transform: `rotate(${index % 2 === 0 ? '1deg' : '-1deg'})` 
                    }}
                  >
                    <step.icon 
                      size={32} 
                      className={`
                        transition-colors duration-300 
                        ${isActive ? 'text-primary' : ''}
                        ${isFeatureHighlight ? 'text-secondary' : ''}
                        ${isCompleted ? 'text-success' : ''}
                        ${!isActive && !isFeatureHighlight && !isCompleted ? 'text-slate-400' : ''}
                      `} 
                      strokeWidth={2} 
                    />
                    
                    {/* Checkmark for completed */}
                    {isCompleted && !selectedFeatureId && (
                      <div className="absolute -top-2 -right-2 text-success bg-white rounded-full border border-success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className={`text-center transition-opacity duration-500 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
                    <p className={`font-hand text-lg font-bold 
                      ${isActive ? 'text-primary' : ''}
                      ${isFeatureHighlight ? 'text-secondary' : ''}
                      ${!isActive && !isFeatureHighlight ? 'text-slate-600' : ''}
                    `}>
                      {step.label}
                    </p>
                    <p className="font-sans text-[10px] text-slate-400 uppercase tracking-wider">
                      {step.sub}
                    </p>
                  </div>
                </div>
                
                {/* Connector Line (Flexible Div) */}
                {index < steps.length - 1 && (
                  <div className="w-12 md:w-20 lg:w-28 h-1 relative mx-2">
                    {/* Background Line (Dashed) */}
                    <div className={`absolute top-0 left-0 w-full h-full border-t-2 border-dashed transition-colors duration-500 ${isDimmed ? 'border-slate-200' : 'border-slate-300'}`}></div>
                    
                    {/* Active Progress Line (Solid Blue) */}
                    <motion.div 
                      className="absolute top-[-1px] left-0 h-[3px] bg-primary"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: (isActive || isCompleted) && !selectedFeatureId ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};