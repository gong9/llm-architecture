/**
 * 千问 API 封装
 */

const QIANWEN_API_BASE = import.meta.env.DEV 
  ? '/api/qianwen/api/v1'
  : 'https://dashscope.aliyuncs.com/api/v1';

export interface EmbeddingResponse {
  output: {
    embeddings: Array<{
      embedding: number[];
      text_index: number;
    }>;
  };
}

export interface ChatResponse {
  output: {
    text: string;
  };
}

export async function getEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (import.meta.env.DEV) {
    headers['x-api-key'] = apiKey;
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(`${QIANWEN_API_BASE}/services/embeddings/text-embedding/text-embedding`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'text-embedding-v3',
      input: { texts },
      parameters: { text_type: 'document' },
    }),
  });

  if (!response.ok) throw new Error(`Embedding 失败: ${response.status}`);
  
  const data: EmbeddingResponse = await response.json();
  return data.output.embeddings.map(e => e.embedding);
}

export async function chatCompletion(messages: Array<{role: string; content: string}>, apiKey: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-DashScope-SSE': 'disable',
  };
  
  if (import.meta.env.DEV) {
    headers['x-api-key'] = apiKey;
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  const response = await fetch(`${QIANWEN_API_BASE}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'qwen-plus',
      input: { messages },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000,
        result_format: 'message',
      },
    }),
  });

  if (!response.ok) throw new Error(`Chat 失败: ${response.status}`);
  
  const data: ChatResponse = await response.json();
  return data.output.text;
}

