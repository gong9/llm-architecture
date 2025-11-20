import React, { useState, useEffect, useRef } from 'react';
import { Play, Settings, Loader2, CheckCircle, FileText, Zap, Database, Sparkles, Copy, Check, ArrowRight, Info, BookOpen, User, BrainCircuit, Lightbulb, Map, Utensils, Ruler, Target, GraduationCap, ChevronDown, ChevronUp, Terminal, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmbeddings, chatCompletion } from '../lib/qianwen-api';

// ... (常量保持不变) ...
const SAMPLE_DOC = `员工休假制度

年假政策：
工作满1年未满5年的员工：每年享有5天带薪年假。
工作满5年未满10年的员工：每年享有10天带薪年假。
工作满10年及以上的员工：每年享有15天带薪年假。`;

interface ExplanationPart {
  title: string;
  icon: any;
  content: string;
  color: string;
  bgColor: string;
  rotate: number;
}

interface FlowStep {
  id: number;
  icon: any;
  title: string;
  description: string;
  explanations: ExplanationPart[];
  pythonCode: string;
  dataIn: any;
  dataOut: any;
  previewIn: any;
  previewOut: any;
  status: 'idle' | 'running' | 'success' | 'error';
  duration?: number;
  color: string;
}

// Mock Data Generators
const mockVector = (dim: number) => Array.from({ length: dim }, () => Math.random() * 2 - 1);
const mockVectors = (count: number, dim: number) => Array.from({ length: count }, () => mockVector(dim));

const stepsData: FlowStep[] = [
  {
    id: 0,
    icon: BookOpen,
    title: '场景设定',
    description: 'RAG 工作原理概览',
    explanations: [],
    color: 'text-slate-600',
    pythonCode: '',
    dataIn: null,
    dataOut: null,
    previewIn: null,
    previewOut: null,
    status: 'idle'
  },
  {
    id: 1,
    icon: FileText,
    title: '文档切分',
    description: 'Chunking',
    color: 'text-blue-600',
    explanations: [
      {
        title: '核心原理',
        icon: Lightbulb,
        content: '大模型就像一个"内存有限"的阅读者，一次只能处理一定长度的文字（Context Window）。',
        color: 'text-amber-700',
        bgColor: 'bg-[#fff9c4]',
        rotate: -1
      },
      {
        title: '通俗比喻',
        icon: Utensils,
        content: '面对一整块战斧牛排（长文档），直接吞下去会噎死。必须把它切成一口大小的肉块（Chunks），才能细嚼慢咽。',
        color: 'text-rose-700',
        bgColor: 'bg-[#ffccbc]',
        rotate: 1
      },
      {
        title: '技术细节',
        icon: Settings,
        content: '使用 RecursiveCharacterTextSplitter，优先在段落(\\n\\n)、句子(。)边界切分，尽量不把一句话切断，保证语义完整。',
        color: 'text-slate-700',
        bgColor: 'bg-[#cfd8dc]',
        rotate: 0.5
      }
    ],
    pythonCode: `from langchain.text_splitter import RecursiveCharacterTextSplitter

# 初始化切分器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200, 
    chunk_overlap=20
)

# 执行切分
chunks = text_splitter.split_text(document)`,
    dataIn: null,
    dataOut: null,
    previewIn: { document: "员工休假制度...\n(长文本)" },
    previewOut: { chunks: ["员工休假制度...", "年假政策...", "工作满1年..."], count: 3 },
    status: 'idle'
  },
  {
    id: 2,
    icon: Zap,
    title: '文档向量化',
    description: 'Embedding',
    color: 'text-indigo-600',
    explanations: [
      {
        title: '核心原理',
        icon: Lightbulb,
        content: '计算机不认识汉字，只认识数字。Embedding 是一种魔法，能把文字变成一串坐标（向量），让计算机理解语义。',
        color: 'text-amber-700',
        bgColor: 'bg-[#fff9c4]',
        rotate: 0.8
      },
      {
        title: '通俗比喻',
        icon: Map,
        content: '想象一个巨大的多维地图，"苹果"和"香蕉"的坐标离得很近，而"苹果"和"手机"离得比较远。',
        color: 'text-blue-700',
        bgColor: 'bg-[#bbdefb]',
        rotate: -0.5
      },
      {
        title: '技术细节',
        icon: Settings,
        content: '调用 text-embedding-v3 模型，把每个 Chunk 变成一个 1024 维的浮点数数组。这个数组浓缩了这段文字的全部语义精华。',
        color: 'text-slate-700',
        bgColor: 'bg-[#cfd8dc]',
        rotate: 1
      }
    ],
    pythonCode: `from langchain.embeddings import DashScopeEmbeddings

# 初始化 Embedding 模型
embeddings = DashScopeEmbeddings(
    model="text-embedding-v3"
)

# 批量向量化
doc_vectors = embeddings.embed_documents(chunks)`,
    dataIn: null,
    dataOut: null,
    previewIn: { chunks: ["片段1", "片段2"] },
    previewOut: { vectors: [[0.12, -0.34, "..."], [0.56, 0.78, "..."]], dimension: 1024 },
    status: 'idle'
  },
  {
    id: 3,
    icon: Zap,
    title: '查询向量化',
    description: 'Query Embedding',
    color: 'text-purple-600',
    explanations: [
      {
        title: '核心原理',
        icon: Lightbulb,
        content: '为了拿用户的问题去和文档做比较，必须把问题也变成同一种"语言"（向量）。',
        color: 'text-amber-700',
        bgColor: 'bg-[#fff9c4]',
        rotate: -1
      },
      {
        title: '通俗比喻',
        icon: Ruler,
        content: '文档已经变成了"坐标"，用户的问题也要变成"坐标"，这样我们才能在地图上算出它们之间的距离。',
        color: 'text-indigo-700',
        bgColor: 'bg-[#c5cae9]',
        rotate: 0.5
      },
      {
        title: '技术细节',
        icon: Settings,
        content: '必须使用和 Step 2 完全相同的模型（text-embedding-v3）来处理问题。如果模型不同，生成的坐标就在不同的地图上，无法比较。',
        color: 'text-slate-700',
        bgColor: 'bg-[#cfd8dc]',
        rotate: -0.5
      }
    ],
    pythonCode: `# 将用户问题转换为向量
query_vector = embeddings.embed_query(query)`,
    dataIn: null,
    dataOut: null,
    previewIn: { query: "工作3年有多少年假？" },
    previewOut: { vector: [0.11, -0.22, 0.33, "..."], dimension: 1024 },
    status: 'idle'
  },
  {
    id: 4,
    icon: Database,
    title: '向量检索',
    description: 'Vector Search',
    color: 'text-orange-600',
    explanations: [
      {
        title: '核心原理',
        icon: Lightbulb,
        content: '这是 RAG 的"检索引擎"。我们计算"问题向量"和所有"文档向量"在空间中的夹角（余弦相似度）。',
        color: 'text-amber-700',
        bgColor: 'bg-[#fff9c4]',
        rotate: 1
      },
      {
        title: '通俗比喻',
        icon: Target,
        content: '就像雷达扫描一样，找出离"问题坐标"最近的那几个"文档坐标"。夹角越小，相关性越高。',
        color: 'text-red-700',
        bgColor: 'bg-[#ffcdd2]',
        rotate: -0.8
      },
      {
        title: '技术细节',
        icon: Settings,
        content: '通常我们只取 Top-K（比如前 3 个）最相关的片段。这相当于从厚厚的书里，精准定位到了最关键的那几页。',
        color: 'text-slate-700',
        bgColor: 'bg-[#cfd8dc]',
        rotate: 0.5
      }
    ],
    pythonCode: `from sklearn.metrics.pairwise import cosine_similarity

# 计算相似度
similarities = cosine_similarity(
    [query_vector], 
    doc_vectors
)[0]

# 获取 Top-K
top_k = similarities.argsort()[-3:][::-1]
relevant_chunks = [chunks[i] for i in top_k]`,
    dataIn: null,
    dataOut: null,
    previewIn: { query_vector: "ready", doc_vectors: "ready" },
    previewOut: { top_results: [{ text: "工作满1年...", score: 0.89 }, { text: "年假政策...", score: 0.75 }] },
    status: 'idle'
  },
  {
    id: 5,
    icon: Sparkles,
    title: '生成答案',
    description: 'Generation',
    color: 'text-green-600',
    explanations: [
      {
        title: '核心原理',
        icon: Lightbulb,
        content: '这是最后一步。大模型不再是凭空瞎编，而是基于我们喂给它的资料来回答，这叫"上下文学习"。',
        color: 'text-amber-700',
        bgColor: 'bg-[#fff9c4]',
        rotate: -1
      },
      {
        title: '通俗比喻',
        icon: GraduationCap,
        content: '开卷考试。我们把刚才找出来的"关键几页"（Context）拍在 AI 面前，对它说："只许看这些资料，回答这个问题。"',
        color: 'text-green-700',
        bgColor: 'bg-[#c8e6c9]',
        rotate: 1
      },
      {
        title: '技术细节',
        icon: Settings,
        content: 'Prompt = "参考资料：" + 检索到的片段 + "问题：" + 用户问题。这样生成的答案既准确，又有据可查，减少幻觉。',
        color: 'text-slate-700',
        bgColor: 'bg-[#cfd8dc]',
        rotate: -0.5
      }
    ],
    pythonCode: `from langchain.chat_models import ChatOpenAI

# 构建上下文
context = "\\n".join(relevant_chunks)
prompt = f"参考：{context}\\n问题：{query}"

# 生成回答
answer = llm.predict(prompt)`,
    dataIn: null,
    dataOut: null,
    previewIn: { context: "相关片段...", query: "..." },
    previewOut: { answer: "根据政策，工作3年享有5天年假。" },
    status: 'idle'
  }
];

// ... (ScenarioView, SyntaxHighlight, JsonHighlight, cosineSimilarity 保持不变) ...
const ScenarioView = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden relative rounded-xl">
      
      {/* 标题区 */}
      <div className="text-center mb-8 md:mb-12 z-10">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">RAG：给 AI 装上“外挂大脑”</h2>
        <p className="text-slate-500 max-w-md mx-auto text-xs md:text-sm">
          大模型不知道你们公司的内部规定？没关系，我们先把文档（知识库）喂给它，
          让它先<b>“查资料”</b>，再<b>“回答问题”</b>。
        </p>
      </div>

      {/* 核心动画区 */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 scale-90 md:scale-100">
        
        {/* 1. 用户提问 */}
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-xl border-4 border-slate-100 flex items-center justify-center relative"
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <User size={32} className="md:hidden text-slate-400" />
            <User size={40} className="hidden md:block text-slate-400" />
            {/* 气泡 */}
            <motion.div 
              className="absolute -top-6 -right-12 bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-2xl rounded-bl-none shadow-lg text-xs md:text-sm font-bold whitespace-nowrap"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              工作3年有多少年假？
            </motion.div>
          </motion.div>
          <div className="text-center font-bold text-slate-600 text-xs md:text-base">困惑的员工</div>
        </div>

        {/* 连接线 1 */}
        <div className="w-1 h-12 md:w-24 md:h-1 bg-slate-200 relative rounded-full overflow-hidden">
           <motion.div 
             className="absolute top-0 left-0 h-full w-1/2 bg-primary"
             animate={{ 
               x: typeof window !== 'undefined' && window.innerWidth < 768 ? [0, 0] : [-50, 100],
               y: typeof window !== 'undefined' && window.innerWidth < 768 ? [-25, 50] : [0, 0]
             }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           />
        </div>

        {/* 2. RAG 引擎 */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div 
              className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-3xl shadow-xl border border-slate-200 flex items-center justify-center z-10 relative"
            >
              <BrainCircuit size={40} className="md:hidden text-primary" />
              <BrainCircuit size={48} className="hidden md:block text-primary" />
            </motion.div>
            {/* 旋转的光环 */}
            <motion.div 
              className="absolute -inset-3 border-2 border-dashed border-primary/30 rounded-3xl -z-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center font-bold text-primary text-xs md:text-base">RAG 智能引擎</div>
        </div>

        {/* 连接线 2 (双向) */}
        <div className="w-1 h-12 md:w-24 md:h-1 bg-slate-200 relative rounded-full overflow-hidden">
           <motion.div 
             className="absolute top-0 left-0 h-full w-1/2 bg-green-500"
             animate={{ 
               x: typeof window !== 'undefined' && window.innerWidth < 768 ? [0, 0] : [100, -50],
               y: typeof window !== 'undefined' && window.innerWidth < 768 ? [50, -25] : [0, 0]
             }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           />
        </div>

        {/* 3. 知识库 */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-28 md:w-24 md:h-32 bg-white border border-slate-200 rounded-xl shadow-xl relative group">
            {/* 堆叠效果 */}
            <div className="absolute top-1 left-1 w-full h-full bg-slate-50 border border-slate-200 rounded-xl -z-10"></div>
            <div className="absolute top-2 left-2 w-full h-full bg-slate-100 border border-slate-200 rounded-xl -z-20"></div>
            
            <div className="h-full flex flex-col items-center justify-center p-2">
              <BookOpen size={24} className="md:hidden text-slate-400 mb-2" />
              <BookOpen size={32} className="hidden md:block text-slate-400 mb-2" />
              <div className="w-12 h-1.5 bg-slate-100 rounded mb-1"></div>
              <div className="w-8 h-1.5 bg-slate-100 rounded mb-1"></div>
              <div className="w-10 h-1.5 bg-slate-100 rounded"></div>
            </div>

            <motion.div 
              className="absolute -bottom-3 -right-3 bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              员工手册.pdf
            </motion.div>
          </div>
          <div className="text-center font-bold text-slate-600 text-xs md:text-base">企业知识库</div>
        </div>

      </div>

      {/* 底部说明 - 移动端隐藏，PC端显示 */}
      <div className="mt-12 hidden md:flex gap-8">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100">
           <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
           <div className="text-sm text-slate-600">切分 & 向量化</div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100">
           <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">2</div>
           <div className="text-sm text-slate-600">检索相关片段</div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100">
           <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">3</div>
           <div className="text-sm text-slate-600">生成最终答案</div>
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
      </div>

    </div>
  );
};

// 语法高亮组件 (代码)
const SyntaxHighlight = ({ code }: { code: string }) => {
  const highlight = (text: string) => {
    const keywords = /\b(from|import|def|return|class|if|else|for|in|while|try|except|finally|with|as|pass|break|continue|and|or|not|is|None|True|False)\b/g;
    const strings = /("|')(?:(?=(\\?))\2.)*?\1/g;
    const comments = /#.*/g;
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g;
    const numbers = /\b\d+\b/g;
    let parts: { text: string; type: string }[] = [{ text, type: 'text' }];
    const applyRule = (regex: RegExp, type: string) => {
      const newParts: typeof parts = [];
      parts.forEach(part => {
        if (part.type !== 'text') {
          newParts.push(part); return;
        }
        let lastIndex = 0; let match;
        while ((match = regex.exec(part.text)) !== null) {
          if (match.index > lastIndex) newParts.push({ text: part.text.slice(lastIndex, match.index), type: 'text' });
          newParts.push({ text: match[0], type });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < part.text.length) newParts.push({ text: part.text.slice(lastIndex), type: 'text' });
      });
      parts = newParts;
    };
    applyRule(strings, 'string'); applyRule(comments, 'comment'); applyRule(keywords, 'keyword');
    applyRule(functions, 'function'); applyRule(numbers, 'number');
    return parts.map((part, i) => (
      <span key={i} className={
        part.type === 'keyword' ? 'text-[#ff79c6] font-bold' :
        part.type === 'string' ? 'text-[#f1fa8c]' :
        part.type === 'comment' ? 'text-[#6272a4] italic' :
        part.type === 'function' ? 'text-[#50fa7b]' :
        part.type === 'number' ? 'text-[#bd93f9]' : 'text-[#f8f8f2]'
      }>{part.text}</span>
    ));
  };
  return <pre className="font-mono text-sm leading-7 whitespace-pre-wrap">{highlight(code)}</pre>;
};

// JSON 高亮组件
const JsonHighlight = ({ data }: { data: any }) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const highlight = (text: string) => {
    const tokens = text.split(/(".*?"|:|\[|\]|\{|\}|,|-?\d+(?:\.\d+)?|true|false|null)/g);
    return tokens.map((token, i) => {
      if (!token) return null;
      let className = 'text-[#f8f8f2]';
      if (token.startsWith('"')) {
        if (tokens[i+1]?.trim() === ':') className = 'text-[#8be9fd] font-bold';
        else className = 'text-[#f1fa8c]';
      } else if (/^-?\d+(?:\.\d+)?$/.test(token)) className = 'text-[#bd93f9]';
      else if (/^(true|false|null)$/.test(token)) className = 'text-[#ff79c6]';
      return <span key={i} className={className}>{token}</span>;
    });
  };
  return <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">{highlight(jsonStr)}</pre>;
};

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dot = 0, norm1 = 0, norm2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export const ProcessFlow: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('qianwen_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState('工作3年有多少天年假？');
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepId, setActiveStepId] = useState(0);
  const [steps, setSteps] = useState<FlowStep[]>(stepsData);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showCodeMobile, setShowCodeMobile] = useState(false);
  
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isRunning && activeStepId > 0 && stepsRef.current[activeStepId]) {
      stepsRef.current[activeStepId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeStepId, isRunning]);

  const updateStep = (id: number, updates: Partial<FlowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const copyCode = async (code: string, id: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runFlow = async () => {
    setIsRunning(true);
    setActiveStepId(1); 
    setSteps(stepsData.map(s => s.id === 0 ? s : ({ ...s, status: 'idle', dataIn: null, dataOut: null })));

    try {
      // Step 1: 切分 (Chunking)
      setActiveStepId(1);
      updateStep(1, { status: 'running' });
      const start1 = Date.now();
      const chunks = SAMPLE_DOC.split(/\n\n+/).filter(c => c.trim().length > 0).map(t => t.trim());
      updateStep(1, {
        status: 'success',
        dataIn: { document: SAMPLE_DOC },
        dataOut: { chunks, count: chunks.length },
        duration: Date.now() - start1
      });
      await new Promise(r => setTimeout(r, 800));

      // Step 2: 向量化 (Embedding)
      setActiveStepId(2);
      updateStep(2, { status: 'running' });
      const start2 = Date.now();
      let docVectors: number[][];
      if (apiKey) {
        docVectors = await getEmbeddings(chunks, apiKey);
      } else {
        docVectors = mockVectors(chunks.length, 1024); 
        await new Promise(r => setTimeout(r, 1000));
      }
      updateStep(2, {
        status: 'success',
        dataIn: { chunks },
        dataOut: { vectors_count: docVectors.length, dim: docVectors[0].length, sample: docVectors[0].slice(0, 3) },
        duration: Date.now() - start2
      });
      await new Promise(r => setTimeout(r, 800));

      // Step 3: 查询向量化
      setActiveStepId(3);
      updateStep(3, { status: 'running' });
      const start3 = Date.now();
      let queryVector: number[];
      if (apiKey) {
        queryVector = (await getEmbeddings([query], apiKey))[0];
      } else {
        queryVector = mockVector(1024);
        await new Promise(r => setTimeout(r, 600));
      }
      updateStep(3, {
        status: 'success',
        dataIn: { query },
        dataOut: { vector_dim: queryVector.length, sample: queryVector.slice(0, 3) },
        duration: Date.now() - start3
      });
      await new Promise(r => setTimeout(r, 800));

      // Step 4: 向量检索
      setActiveStepId(4);
      updateStep(4, { status: 'running' });
      const start4 = Date.now();
      let similarities;
      if (apiKey) {
         similarities = docVectors.map((docVec, idx) => ({
          text: chunks[idx],
          score: cosineSimilarity(queryVector, docVec)
        })).sort((a, b) => b.score - a.score).slice(0, 3);
      } else {
        similarities = chunks.map((chunk) => ({
          text: chunk,
          score: chunk.includes('工作满') ? 0.89 : 0.75
        })).sort((a, b) => b.score - a.score).slice(0, 3);
      }

      updateStep(4, {
        status: 'success',
        dataIn: { query_vec: 'ready', doc_vecs: 'ready' },
        dataOut: { top_results: similarities.map(s => ({ score: s.score.toFixed(3), text: s.text.slice(0, 15) + '...' })) },
        duration: Date.now() - start4
      });
      await new Promise(r => setTimeout(r, 800));

      // Step 5: 生成
      setActiveStepId(5);
      updateStep(5, { status: 'running' });
      const start5 = Date.now();
      const context = similarities.map(s => s.text).join('\n\n');
      let answer: string;

      if (apiKey) {
        answer = await chatCompletion([
          { role: 'system', content: '你是HR助手。' },
          { role: 'user', content: `参考：\n${context}\n\n问：${query}` }
        ], apiKey);
      } else {
        answer = "根据公司《员工休假制度》规定：\n\n1. 工作满1年未满5年的员工，每年享有5天带薪年假。\n2. 工作满3年属于该区间，因此您拥有 5 天年假。";
        await new Promise(r => setTimeout(r, 1500));
      }

      updateStep(5, {
        status: 'success',
        dataIn: { context_len: context.length, query },
        dataOut: { answer },
        duration: Date.now() - start5
      });
    } catch (error) {
      console.error(error);
      updateStep(activeStepId, { status: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  const activeStep = steps.find(s => s.id === activeStepId) || steps[0];

  return (
    <div className="h-full flex flex-col gap-3 font-sans overflow-hidden">
      {/* 顶部紧凑控制栏 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-ali px-4 py-3 flex items-center justify-between flex-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-none">
            <Zap size={18} />
          </div>
          <div className="hidden md:block">
            <h2 className="font-bold text-slate-800 text-sm">可视化运行</h2>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入问题..."
            className="flex-1 max-w-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0"
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center gap-2 flex-none">
           <button
              onClick={runFlow}
              disabled={isRunning}
              className={`
                flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                ${isRunning 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary text-white shadow-md hover:scale-105 active:scale-95'
                }
              `}
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span className="hidden md:inline">{isRunning ? '运行' : '运行'}</span>
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`
                p-1.5 rounded-lg border transition-colors
                ${apiKey ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}
              `}
              title={apiKey ? "已配置 API Key (真实模式)" : "未配置 API Key (模拟模式)"}
            >
              <Settings size={16} />
            </button>
        </div>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-slate-200 shadow-ali p-3 overflow-hidden flex-none absolute top-16 right-4 z-50 w-80 shadow-2xl"
          >
             <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="配置 Key 开启真实调用 (选填)"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
              <button 
                onClick={() => { localStorage.setItem('qianwen_api_key', apiKey); setShowSettings(false); }}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs"
              >
                保存
              </button>
             </div>
             <div className="mt-2 text-[10px] text-slate-400">
               * 不填则使用 Mock 数据演示，无需任何费用。
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 min-h-0">
        
        {/* 左侧导航 - 宽度减小 (col-span-2) */}
        <div className="hidden md:block col-span-2 bg-white rounded-xl border border-slate-200 shadow-ali overflow-y-auto p-6 custom-scrollbar min-w-[200px]">
          <div className="relative">
            {/* 手绘 SVG 虚线连接 - 居中对齐 */}
            <div className="absolute left-[11px] top-4 bottom-4 w-2 pointer-events-none z-0">
               <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                  <path 
                    d="M 1 0 Q 4 20 0 40 Q -4 60 1 80 Q 4 100 0 120 Q -4 140 1 160 Q 4 180 0 200 Q -4 220 1 240 Q 4 260 0 280 Q -4 300 1 320 Q 4 340 0 360 Q -4 380 1 400 Q 4 420 0 440 Q -4 460 1 480 Q 4 500 0 520 Q -4 540 1 560 Q 4 580 0 600" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="2" 
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
               </svg>
            </div>

            {steps.map((step, idx) => {
               const isActive = activeStepId === step.id;
               const isCompleted = step.status === 'success';
               const isIdle = step.status === 'idle';

               return (
                <div
                  key={step.id}
                  ref={el => stepsRef.current[step.id] = el}
                  onClick={() => !isRunning && setActiveStepId(step.id)}
                  className={`relative flex items-start gap-3 mb-8 last:mb-0 cursor-pointer group z-10`}
                >
                  {/* 节点图标/圆点 - 选中态简化 */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all z-10 mt-0.5
                    ${isActive 
                      ? 'bg-white border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.15)] scale-110' 
                      : isCompleted 
                        ? 'bg-white border-primary' 
                        : 'bg-white border-slate-200 group-hover:border-slate-300'
                    }
                  `}>
                    {step.status === 'running' ? (
                      <Loader2 size={12} className="animate-spin text-primary" />
                    ) : isCompleted ? (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    )}
                  </div>

                  {/* 文本内容 */}
                  <div className={`flex-1 transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>
                    <h3 className={`font-bold text-sm leading-none mt-1.5 ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                      {step.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-hand">{step.description}</p>
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        {/* 移动端 Step 进度条 */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar flex-none">
          {steps.map((step) => (
             <div 
               key={step.id}
               onClick={() => !isRunning && setActiveStepId(step.id)}
               className={`
                 flex-none px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border
                 ${activeStepId === step.id 
                   ? 'bg-primary text-white border-primary' 
                   : 'bg-white text-slate-500 border-slate-200'
                 }
               `}
             >
               {step.status === 'success' && <Check size={12} />}
               {step.status === 'running' && <Loader2 size={12} className="animate-spin" />}
               {!step.status || step.status === 'idle' ? <span>{step.id}</span> : null}
               <span>{step.title.split(' ')[0]}</span>
             </div>
          ))}
        </div>

        {/* 右侧详情 - 宽度增加 (col-span-10) */}
        <div className="flex-1 md:col-span-10 bg-white rounded-xl border border-slate-200 shadow-ali flex flex-col overflow-hidden">
          
          {/* 场景视图 (Step 0) */}
          {activeStepId === 0 ? (
            <ScenarioView />
          ) : (
            <>
              {/* 头部信息 */}
              <div className="px-4 md:px-5 py-4 border-b border-slate-100 bg-white flex-none z-10 shadow-sm overflow-y-auto max-h-[40vh] md:max-h-none">
                 <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 pb-2 border-b md:border-none border-slate-50">
                   <div className={`px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold font-mono`}>
                     STEP {activeStepId}
                   </div>
                   <h3 className={`text-base md:text-lg font-bold ${activeStep.color} truncate`}>
                     {activeStep.title}
                   </h3>
                   <div className="flex-1" />
                   {/* 移动端切换代码显示按钮 */}
                   <button
                     onClick={() => setShowCodeMobile(!showCodeMobile)}
                     className="md:hidden flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200"
                   >
                     {showCodeMobile ? <Monitor size={12} /> : <Terminal size={12} />}
                     {showCodeMobile ? '看结果' : '看代码'}
                   </button>
                   <button
                     onClick={() => copyCode(activeStep.pythonCode, activeStepId)}
                     className="hidden md:block text-slate-400 hover:text-primary transition-colors"
                   >
                     {copiedId === activeStepId ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                 </div>

                 {/* 知识卡片 */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                   {activeStep.explanations.map((exp, i) => (
                     <div 
                        key={i} 
                        className={`${exp.bgColor} p-3 rounded-sm shadow-sm relative`}
                        style={{ 
                          transform: typeof window !== 'undefined' && window.innerWidth >= 768 ? `rotate(${exp.rotate}deg)` : 'none',
                          boxShadow: '2px 2px 5px rgba(0,0,0,0.05)' 
                        }}
                     >
                       {/* 胶带效果（装饰）- 仅PC显示 */}
                       <div className="hidden md:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/30 backdrop-blur-[1px] shadow-sm rotate-1"></div>

                       <div className="flex items-center gap-1.5 mb-1.5">
                         <motion.div
                           animate={
                             exp.title === '核心原理' ? { opacity: [0.6, 1, 0.6] } :
                             exp.title === '通俗比喻' ? { rotate: [-5, 5, -5] } :
                             { rotate: 360 }
                           }
                           transition={{ 
                             duration: exp.title === '技术细节' ? 4 : 2, 
                             repeat: Infinity, 
                             ease: exp.title === '技术细节' ? "linear" : "easeInOut" 
                           }}
                         >
                           <exp.icon size={14} className={exp.color} />
                         </motion.div>
                         <span className={`text-xs font-bold ${exp.color} font-sans`}>{exp.title}</span>
                       </div>
                       <p 
                         className="text-xs text-slate-800 leading-relaxed"
                         style={{ fontFamily: '"KaiTi", "STKaiti", "FangSong", serif' }}
                       >
                         {exp.content}
                       </p>
                     </div>
                   ))}
                 </div>
              </div>

              {/* 内容区 */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] overflow-hidden">
                
                {/* 代码区 */}
                <div className={`
                  border-b border-[#333] overflow-hidden flex flex-col transition-all
                  ${showCodeMobile ? 'flex-1 h-full' : 'hidden md:flex h-[55%]'}
                `}>
                   <div className="h-8 bg-[#252526] border-b border-[#333] flex items-center px-4 gap-2 flex-none">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5555]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f1fa8c]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#50fa7b]"></div>
                      <span className="ml-2 text-xs text-[#888] font-mono font-medium">implementation.py</span>
                   </div>
                   <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                     <SyntaxHighlight code={activeStep.pythonCode} />
                   </div>
                </div>

                {/* 输入输出区 */}
                <div className={`
                  grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#333] min-h-0 bg-[#1e1e1e]
                  ${!showCodeMobile ? 'flex-1 h-full' : 'hidden md:grid h-[45%]'}
                `}>
                   {/* Input */}
                   <div className="flex flex-col min-h-0 h-1/2 md:h-full">
                     <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex items-center gap-2 text-xs font-bold text-[#6272a4] uppercase tracking-wide">
                       <ArrowRight size={14} /> Input
                     </div>
                     <div className="flex-1 overflow-auto p-4 custom-scrollbar text-gray-300">
                       <JsonHighlight data={activeStep.dataIn || activeStep.previewIn} />
                     </div>
                   </div>

                   {/* Output */}
                   <div className="flex flex-col min-h-0 h-1/2 md:h-full">
                     <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex items-center gap-2 text-xs font-bold text-[#50fa7b] uppercase tracking-wide">
                       <CheckCircle size={14} /> Output
                     </div>
                     <div className="flex-1 overflow-auto p-4 custom-scrollbar text-gray-300">
                       <JsonHighlight data={activeStep.dataOut || activeStep.previewOut} />
                     </div>
                   </div>
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
