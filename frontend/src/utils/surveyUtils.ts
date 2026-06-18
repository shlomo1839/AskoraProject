import type { Question, Section, Survey } from '../types/survey.types';

export function getAllQuestions(survey: Survey): Question[] {
  return survey.sections.flatMap((section) => section.questions);
}

export function getTotalQuestionCount(survey: Survey): number {
  return getAllQuestions(survey).length;
}

export function getTotalSectionCount(survey: Survey): number {
  return survey.sections.length;
}

export function createEmptyQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    type: 'open',
    title: '',
    isRequired: false,
  };
}

export function createEmptySection(): Section {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    questions: [createEmptyQuestion()],
  };
}
