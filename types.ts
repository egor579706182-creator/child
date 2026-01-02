
export enum Gender {
  MALE = 'Мужской',
  FEMALE = 'Женский'
}

export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
  id: number;
  text: string;
  category: 'social' | 'verbal' | 'nonverbal' | 'behavioral' | 'sensory';
  options: QuestionOption[];
}

export interface AssessmentResponse {
  questionId: number;
  value: number;
}

export interface AssessmentData {
  age: number;
  gender: Gender;
  responses: AssessmentResponse[];
}

export interface AnalysisResult {
  impairmentLevel: string;
  clinicalInterpretation: string;
  recommendations: string[];
  prognosis: string;
  scientificContext: {
    english: string;
    russian: string;
    german: string;
  };
  sources: {
    uri: string;
    title: string;
  }[];
}
