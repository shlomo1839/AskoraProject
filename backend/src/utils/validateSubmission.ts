import { AppError } from '../middleware/error.middleware';
import type { IAnswer } from '../models/Submission';
import type { ISurvey } from '../models/Survey';
import { getAllQuestions } from './surveyHelpers';

export function validateSubmissionAnswers(survey: ISurvey, answers: IAnswer[]): IAnswer[] {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError(400, 'יש לשלוח לפחות תשובה אחת');
  }

  const allQuestions = getAllQuestions(survey);
  const validQuestionIds = new Set(allQuestions.map((question) => question.id));

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

    const value = answersByQuestionId.get(question.id);
    return value === undefined || value === '';
  });

  if (missingRequired) {
    throw new AppError(400, `יש לענות על השאלה: "${missingRequired.title}"`);
  }

  return answers;
}
