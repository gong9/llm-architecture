<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RAG Master Class - 可视化交互式教程

一个交互式的 RAG（检索增强生成）学习平台，结合架构可视化和实时代码演示，在浏览器中实际运行每个步骤并展示输入输出，帮助你深入理解 RAG 技术的核心原理。

## ✨ 功能特点

### 📚 架构说明模式
- **可视化流程图**：直观展示 RAG 的 5 个核心阶段
- **详细解释**：每个阶段都有深入浅出的说明、示例和工具推荐
- **高级特性**：了解混合检索、Prompt 编排、智能工作流等进阶技术
- **动画演示**：自动播放流程，帮助理解数据流转

### 🎯 可视化演示模式
- **浏览器中实际运行**：无需安装 Python，直接在浏览器体验完整 RAG 流程
- **代码 + 执行同步展示**：每个步骤显示实际执行的代码
- **输入输出可视化**：清晰展示每步的输入数据和输出结果
- **真实 API 调用**：调用千问 API 进行向量化和生成
- **逐步执行**：5 个核心步骤按顺序运行，实时展示进度
- **一键复制代码**：所有代码可复制到本地项目使用

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **UI 组件**：Lucide React Icons + Framer Motion
- **代码示例**：Python + LangChain + 千问大模型

## 📦 快速开始

### 前置要求

- Node.js 16+ 
- pnpm（推荐）或 npm

### 安装步骤

1. **克隆仓库并安装依赖**

```bash
# 克隆项目
git clone <repository-url>
cd rag-master-class

# 安装依赖
pnpm install
# 或者
npm install
```

2. **配置 API Key**

获取千问 API Key：访问 [阿里云 DashScope](https://dashscope.console.aliyun.com/apiKey)

3. **运行应用**

```bash
pnpm dev
# 或者
npm run dev
```

4. **打开浏览器访问** 

默认地址：http://localhost:3000

## 📖 使用指南

### 架构说明模式

1. 点击顶部的 **"架构说明"** 标签
2. 点击 **"运行流程"** 按钮观看自动演示
3. 或点击流程图中的各个节点查看详细说明
4. 右侧查看高级特性介绍

### 可视化演示模式

1. 点击顶部的 **"可视化演示"** 标签
2. 点击右上角设置按钮 ⚙️，输入你的千问 API Key
3. 在输入框输入问题（或使用默认问题）
4. 点击 **"运行演示"** 按钮
5. 观察每个步骤的执行过程：
   - 查看每步执行的代码
   - 查看输入数据（蓝色框）
   - 查看输出结果（绿色框）
   - 查看执行耗时
6. 点击 **"复制代码"** 按钮复制任意步骤的代码

**5 个核心步骤**：
1. **文档切分** - 将文档按段落切分为小块
2. **向量化** - 调用千问 API 将文本转换为向量
3. **查询向量化** - 将用户问题转换为向量
4. **相似度检索** - 计算余弦相似度并检索 top-3
5. **LLM 生成答案** - 基于检索结果生成最终答案

## 🏗️ 项目结构

```
rag-master-class/
├── components/              # React 组件
│   ├── RagVisualizer.tsx    # RAG 流程可视化
│   ├── StageCard.tsx        # 阶段详情卡片
│   ├── AdvancedSection.tsx  # 高级特性展示
│   └── CodeDemo.tsx         # 代码示例展示 ✨
├── App.tsx                  # 主应用组件
├── types.ts                 # TypeScript 类型定义
├── index.tsx                # 应用入口
└── index.html               # HTML 模板
```

## 🎓 学习路径建议

1. **第一步**：查看架构说明，理解 RAG 的核心概念和流程
2. **第二步**：浏览代码示例，了解每个阶段的具体实现
3. **第三步**：复制代码到本地，安装依赖并实际运行
4. **第四步**：修改示例代码，尝试不同的参数和数据
5. **第五步**：基于示例代码构建自己的 RAG 应用

## 🚀 部署

### 构建生产版本

```bash
pnpm build
# 或者
npm run build
```

构建产物在 `dist/` 目录，可以部署到任何静态托管服务：
- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

**注意**：部署时记得配置环境变量 `VITE_QIANWEN_API_KEY`

## 💡 常见问题

### Q: 代码可以直接运行吗？
A: 可以！代码示例都是真实可运行的 Python 代码。你需要：
1. 安装 Python 3.8+
2. 安装依赖：`pip install langchain openai dashscope chromadb`
3. 替换代码中的 API Key 为你自己的
4. 运行代码即可

### Q: 为什么使用 LangChain？
A: LangChain 是目前最流行的 LLM 应用开发框架，提供了丰富的工具和抽象，大大简化了 RAG 应用的开发。

### Q: 可以使用其他大模型吗？
A: 完全可以！代码示例使用千问，但你可以轻松替换为：
- OpenAI GPT-4
- Anthropic Claude
- 本地开源模型（Llama、Mistral 等）

只需修改模型初始化部分即可。

### Q: 向量数据库有哪些选择？
A: 除了示例中的 Chroma，还有很多选择：
- **云服务**：Pinecone、Weaviate Cloud、Qdrant Cloud
- **开源**：Milvus、Elasticsearch、Pgvector
- **轻量级**：FAISS、Annoy

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

---

**Made with ❤️ for RAG learners**
