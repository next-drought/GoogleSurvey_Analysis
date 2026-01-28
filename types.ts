
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

export type ProjectSource = 'local';

export interface SurveyProject {
  id: string;
  name: string;
  localContent?: string;
  source: ProjectSource;
  createdAt: number;
}
