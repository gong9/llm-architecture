import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Binary, 
  Database, 
  Filter, 
  Brain, 
  Play, 
  Pause,
  Waypoints, 
  MessageSquareCode, 
  FolderArchive, 
  Workflow
} from 'lucide-react';
import { RagVisualizer } from './components/RagVisualizer';
import { StageCard } from './components/StageCard';
import { AdvancedSection } from './components/AdvancedSection';
import { RagStep, DisplayData } from './types';

// --- Data Definitions ---

// 1. Core Pipeline Data
const coreStages: Record<RagStep, DisplayData | null> = {
  [RagStep.IDLE]: null,
  [RagStep.CHUNKING]: {
    id: RagStep.CHUNKING,
    title: '文档预处理 (Document Processing)',
    icon: FileText,
    category: 'CORE',
    tag: '01',
    description: '把“书”读薄，切成小块。',
    details: {
      function: '就像做菜前要切菜一样。模型无法一次性消化整本书，我们需要将 PDF、Word 等非结构化数据清洗，并切分为语义完整、长度适中（如 512 tokens）的“知识碎片”。这是 RAG 质量的地基。',
      includes: ['文档解析 (PDF/HTML/DB)', '数据清洗 & 降噪', 'Chunking (语义切分)', '元数据 (Metadata)'],
      example: '输入：一份 50 页的《员工手册》。\n输出：300 个小卡片，每张卡片只包含一条具体的规定（如“年假政策”），并标记了页码来源。',
      tools: ['LangChain', 'LlamaIndex', 'Unstructured', 'Dify']
    }
  },
  [RagStep.EMBEDDING]: {
    id: RagStep.EMBEDDING,
    title: '向量化 (Embedding)',
    icon: Binary,
    category: 'CORE',
    tag: '02',
    description: '把文字变成计算机能懂的“数字坐标”。',
    details: {
      function: '人类看字义，电脑看数字。Embedding 模型将文本映射到高维向量空间。语义相似的内容（如“手机”和“移动电话”），虽然字不同，但在数学空间里的坐标距离非常近。',
      includes: ['Text-to-Vector', '多模态 Embedding', '语义压缩', '维度适配'],
      example: '文本 "苹果" → 向量 [0.1, 0.9...]。\n如果是水果语境，它离"香蕉"近；如果是科技语境，它离"微软"近。',
      tools: ['OpenAI text-embedding-3', 'bge-m3', 'jina-embeddings-v3', 'Cohere']
    }
  },
  [RagStep.VECTOR_STORE]: {
    id: RagStep.VECTOR_STORE,
    title: '向量数据库 (Vector Store)',
    icon: Database,
    category: 'CORE',
    tag: '03',
    description: '拥有“过目不忘”能力的超级图书馆。',
    details: {
      function: '传统数据库查关键词（Exact Match），向量数据库查“意思”（Semantic Match）。它使用 ANN 算法，能在几毫秒内从亿级数据中，找到和用户问题最“像”的那几个片段。',
      includes: ['HNSW / IVF 索引', '相似度计算 (Cosine)', 'Metadata Filter', 'CRUD 管理'],
      example: '用户问：“怎么报销？”\n即使库里没有“报销”二字，也能搜出含有“费用申请流程”的文档，因为它们意思相近。',
      tools: ['Milvus', 'Weaviate', 'Qdrant', 'Elasticsearch', 'Pgvector']
    }
  },
  [RagStep.RERANK]: {
    id: RagStep.RERANK,
    title: '重排序 (Rerank Model)',
    icon: Filter,
    category: 'CORE',
    tag: '04',
    description: '给搜索结果进行“精修”打分。',
    details: {
      function: '向量库是“海选”（速度快但粗糙，看大概意思），重排序是“决赛”（速度慢但精准）。Rerank 模型会像严厉的阅卷老师，逐字对比问题和搜索到的片段，把真正有用的排到第一位。',
      includes: ['粗排 (Recall)', '精排 (Precision)', '相关性打分', 'Top-N 截断'],
      example: '海选找出了 50 条关于“苹果”的资料（含水果和手机）。\n用户问的是“苹果股价”，Rerank 会把讲“手机/公司”的资料踢到前 3 名，把讲“水果”的刷下去。',
      tools: ['Cohere Rerank', 'bge-reranker', 'jina-reranker']
    }
  },
  [RagStep.GENERATION]: {
    id: RagStep.GENERATION,
    title: '模型生成 (LLM Generation)',
    icon: Brain,
    category: 'CORE',
    tag: '05',
    description: '基于参考资料的“开卷考试”。',
    details: {
      function: '这是最后一步。大模型不再“瞎编”（幻觉），而是阅读我们前面找出的精准资料（Context），结合用户的问题，进行归纳总结，生成有理有据的回答。',
      includes: ['Prompt Engineering', 'Context Window', 'In-context Learning', '引用标注'],
      example: 'Prompt：你是一个助手。请根据以下资料：[资料1, 资料2...] \n回答用户问题：[问题]。\nLLM：根据资料1，答案是...',
      tools: ['GPT-4o', 'Claude 3.5', 'DeepSeek R1', 'Llama 3']
    }
  }
};

// 2. Advanced Features Data
const advancedFeatures: DisplayData[] = [
  {
    id: 'HYBRID_SEARCH',
    title: "混合检索 (Hybrid Search)",
    category: 'ADVANCED',
    tag: 'PRO',
    icon: Waypoints,
    description: "既懂关键词，又懂语义",
    details: {
      function: "就像警察找人，既查“身份证号”（精确匹配），又查“体貌特征”（模糊匹配）。纯向量检索有时会漏掉精准的关键词（如产品型号），混合检索同时运行 Keyword Search (BM25) 和 Vector Search，再加权融合，确保万无一失。",
      includes: ["关键词匹配 (BM25)", "向量检索 (Vector)", "多路召回 (RRF)", "权重动态调整"],
      example: "用户搜“C# 报错”，向量可能会找“编程错误”，但 BM25 能精准命中包含 \"C#\" 字符的文档。",
      tools: ["ElasticSearch", "Pinecone", "Weaviate", "Qdrant"]
    }
  },
  {
    id: 'PROMPT_ORCHESTRATION',
    title: "Prompt 编排 (Orchestration)",
    category: 'ADVANCED',
    tag: 'PRO',
    icon: MessageSquareCode,
    description: "不仅仅是提问，而是设计指令",
    details: {
      function: "它是 AI 的“经纪人”。用户原本随意的提问（“那个怎么弄？”），经过编排层的润色，变成了带有上下文、格式要求、安全护栏的专业指令（Prompt），再交给大模型处理。",
      includes: ["问题改写 (Rewrite)", "思维链 (CoT)", "防幻觉护栏", "结构化输出"],
      example: "用户问“它多少钱？”，Orchestration 会改写为“请查询 iPhone 15 的价格”，并加上“请用表格回答”的系统指令。",
      tools: ["LangChain", "LangFuse", "Dify", "PromptLayer"]
    }
  },
  {
    id: 'DOC_OPS',
    title: "文档管理 (Document Ops)",
    category: 'ADVANCED',
    tag: 'PRO',
    icon: FolderArchive,
    description: "如何让数据保持新鲜？",
    details: {
      function: "知识库的“保洁阿姨”。文档不是一次性导入就完了。你需要处理：源文件更新了怎么同步？旧文件删了向量库怎么清理？如何给数据打标签（Metadata）以便按权限过滤？",
      includes: ["增量更新", "版本控制", "垃圾数据清洗", "权限隔离"],
      example: "政策更新了，系统自动删除旧版本的向量切片，并嵌入新版本，同时保留历史归档。",
      tools: ["Dify", "Airbyte", "Unstructured", "Custom ETL"]
    }
  },
  {
    id: 'AGENTIC_RAG',
    title: "智能工作流 (Agentic RAG)",
    category: 'ADVANCED',
    tag: 'PRO',
    icon: Workflow,
    description: "自动化思考与决策",
    details: {
      function: "从“按指令办事”升级为“自主决策”。传统 RAG 是线性的（查->写）。Agentic RAG 会先思考：“这个问题需要查库吗？资料够吗？不够要不要换个关键词再查一次？”。它能处理复杂的多步逻辑。",
      includes: ["n8n 自动编排", "自我修正 (Self-correction)", "多跳推理", "工具调用"],
      example: "用户问“对比一下今年和去年的财报”，Agent 会拆解为“查今年财报”、“查去年财报”、“计算差异”三个步骤执行。",
      tools: ["n8n", "LangGraph", "AutoGPT", "CrewAI"]
    }
  }
];

const stepOrder = [RagStep.CHUNKING, RagStep.EMBEDDING, RagStep.VECTOR_STORE, RagStep.RERANK, RagStep.GENERATION];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RagStep>(RagStep.IDLE);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback logic
  useEffect(() => {
    if (!isPlaying) return;
    let timeout: ReturnType<typeof setTimeout>;

    const playSequence = async () => {
       // Reset selection when playing
       setSelectedFeatureId(null);
       
       if (currentStep === RagStep.IDLE || currentStep === RagStep.GENERATION) {
         setCurrentStep(RagStep.CHUNKING);
       }
       const runStep = (index: number) => {
          if (index >= stepOrder.length) {
            setIsPlaying(false);
            return;
          }
          const step = stepOrder[index];
          setCurrentStep(step);
          timeout = setTimeout(() => runStep(index + 1), 3000); 
       };
       const startIndex = stepOrder.indexOf(currentStep) === -1 ? 0 : stepOrder.indexOf(currentStep) + 1;
       if (startIndex > 0 && startIndex < stepOrder.length) {
          timeout = setTimeout(() => runStep(startIndex), 1000);
       } else {
          runStep(0);
       }
    };
    playSequence();
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Handle Step Click from Visualizer
  const handleStepClick = (step: RagStep) => {
    setIsPlaying(false);
    setSelectedFeatureId(null); // Deselect advanced feature
    setCurrentStep(step);
  };

  // Handle Advanced Feature Click
  const handleFeatureClick = (feature: DisplayData) => {
    setIsPlaying(false);
    setCurrentStep(RagStep.IDLE); // Deselect core pipeline
    setSelectedFeatureId(feature.id);
  };

  // Determine what to display in the StageCard
  // 1. If an Advanced Feature is selected, show that.
  // 2. Else if a Core Step is selected, show that.
  // 3. Else show nothing (or prompt)
  let displayData: DisplayData | null = null;
  
  if (selectedFeatureId) {
    displayData = advancedFeatures.find(f => f.id === selectedFeatureId) || null;
  } else if (currentStep !== RagStep.IDLE) {
    displayData = coreStages[currentStep];
  }

  return (
    <div className="h-screen w-screen bg-bg-page text-text-main flex flex-col overflow-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* 1. Navbar (Minimal) */}
      <header className="h-14 flex-none bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
             <span className="font-hand font-bold text-lg">R</span>
           </div>
           <h1 className="font-bold text-lg text-text-main tracking-tight">RAG <span className="font-normal text-text-tertiary">Core Architecture</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-xs text-text-tertiary font-medium px-3 py-1 bg-slate-100 rounded-full hidden sm:block">
             Minimal Viable Version
           </div>
           <button 
             onClick={() => isPlaying ? setIsPlaying(false) : setIsPlaying(true)}
             className={`
               flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all
               ${isPlaying 
                 ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                 : 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/30'
               }
             `}
           >
             {isPlaying ? <><Pause size={14} /> 暂停演示</> : <><Play size={14} /> 运行流程</>}
           </button>
        </div>
      </header>

      {/* 2. Main Content - Dashboard Grid */}
      {/* Grid: Top row (Visualizer) fixed height 40%, Bottom row (Details) remaining space */}
      <main className="flex-1 grid grid-rows-[40%_1fr] p-4 gap-4 overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* Top Panel: Visualizer */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-ali relative overflow-hidden flex flex-col">
           <RagVisualizer 
              currentStep={currentStep} 
              onStepClick={handleStepClick} 
              selectedFeatureId={selectedFeatureId}
           />
        </section>

        {/* Bottom Panel: Split View */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full overflow-hidden">
          
          {/* Left: Detail Card (7/12 width) */}
          <div className="md:col-span-7 lg:col-span-8 h-full">
             <StageCard data={displayData} />
          </div>

          {/* Right: Advanced Features (5/12 width) */}
          <div className="md:col-span-5 lg:col-span-4 h-full">
             <AdvancedSection 
                features={advancedFeatures} 
                selectedId={selectedFeatureId} 
                onSelect={handleFeatureClick} 
             />
          </div>

        </section>

      </main>
    </div>
  );
};

export default App;