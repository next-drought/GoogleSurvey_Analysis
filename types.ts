
export interface SurveyResponse {
  [key: string]: string | number;
}

export interface DashboardData {
  headers: string[];
  rows: SurveyResponse[];
  timestamp: string;
}

export interface AIInsight {
  title: string;
  observation: string;
  recommendation: string;
  type: 'positive' | 'neutral' | 'negative' | 'critical';
}

export type ProjectSource = 'link' | 'local';

export interface SurveyProject {
  id: string;
  name: string;
  url?: string;
  localContent?: string; // Stored content for local files
  source: ProjectSource;
  createdAt: number;
}
