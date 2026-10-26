export interface ThoughtStep {
  id: string;
  num: string;
  title: string;
  description: string;
  stat?: string;
  highlight?: string;
}

export interface ExpertiseItem {
  id: string;
  num: string;
  title: string;
  description: string;
  focusAreas: string[];
}

export interface SolutionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  impact: string;
}

export interface FounderProfile {
  name: string;
  role: string;
  domains: string;
  credentials: string[];
  bio: string[];
  honors?: string[];
}

export interface InsightArticle {
  id: string;
  tag: string;
  title: string;
  status: string;
  description: string;
  readTime?: string;
}
