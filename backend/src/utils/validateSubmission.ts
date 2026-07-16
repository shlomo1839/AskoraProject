import { AppError } from '../middleware/error.middleware';
import type { IAnswer } from '../models/Submission';
import type { ISurvey, IQuestion } from '../models/Survey';
import { getAllQuestions } from './surveyHelpers';

export function isQuestionVisible(
  question: IQuestion,
  answersMap: Map<string, any>,
  questionsMap: Map<string, IQuestion>
): boolean {
  if (!question.dependsOn || !question.dependsOn.questionId) return true;
  
  const dependentQuestion = questionsMap.get(question.dependsOn.questionId);
  if (!dependentQuestion) return true;

  const isDependentVisible = isQuestionVisible(dependentQuestion, answersMap, questionsMap);
  if (!isDependentVisible) return false;

  const answerValue = answersMap.get(question.dependsOn.questionId);
  return answerValue === question.dependsOn.value;
}

export function validateSubmissionAnswers(survey: ISurvey, answers: IAnswer[]): IAnswer[] {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError(400, 'יש לשלוח לפחות תשובה אחת');
  }

  const allQuestions = getAllQuestions(survey);
  const validQuestionIds = new Set(allQuestions.map((question) => question.id));

  const questionsMap = new Map(allQuestions.map((q) => [q.id, q]));

  for (const answer of answers) {
    if (!answer.questionId || answer.value === undefined) {
      throw new AppError(400, 'תשובה לא תקינה');
    }

    if (!validQuestionIds.has(answer.questionId)) {
      throw new AppError(400, 'שאלה לא שייכת לסקר');
    }
  }

  const answersByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer.value])
  );

  const missingRequired = allQuestions.find((question) => {
    if (!question.isRequired) {
      return false;
    }

    const isVisible = isQuestionVisible(question, answersByQuestionId, questionsMap);
    if (!isVisible) {
      return false;
    }

    const value = answersByQuestionId.get(question.id);
    return value === undefined || value === '';
  });

  if (missingRequired) {
    throw new AppError(400, `יש לענות על השאלה: "${missingRequired.title}"`);
  }

  const filteredAnswers = answers.filter(answer => {
    const q = questionsMap.get(answer.questionId);
    return q && isQuestionVisible(q, answersByQuestionId, questionsMap);
  });

  if (filteredAnswers.length === 0) {
    throw new AppError(400, 'יש לשלוח לפחות תשובה אחת תקפה');
  }

  return filteredAnswers;
}
