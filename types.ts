import { LucideIcon } from 'lucide-react';

export enum RagStep {
  IDLE = 'IDLE',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  VECTOR_STORE = 'VECTOR_STORE',
  RERANK = 'RERANK',
  GENERATION = 'GENERATION',
}

export interface ContentDetails {
  function: string;
  includes: string[];
  example: string;
  tools: string[];
}

// A unified interface for both Core Stages and Advanced Features
export interface DisplayData {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  details: ContentDetails;
  tag: string; // e.g. "01", "PRO"
  category: 'CORE' | 'ADVANCED';
}
