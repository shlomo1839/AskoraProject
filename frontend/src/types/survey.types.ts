export type QuestionType = 'open' | 'multiple-choice' | 'rating';

export interface Condition {
  questionId: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[];
  isRequired: boolean;
  dependsOn?: Condition | null;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  createdBy: string;
  createdAt: string;
  closesAt?: string | null;
}

export interface Answer {
  questionId: string;
  value: string | number | string[];
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
}
