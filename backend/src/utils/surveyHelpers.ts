import type { Request } from 'express';
import { Survey, type ISurvey, type IQuestion } from '../models/Survey';
import { AppError } from '../middleware/error.middleware';

export function getRouteParam(req: Request, paramName: string): string {
  const value = req.params[paramName];
  return Array.isArray(value) ? value[0] : value;
}

export async function findSurveyOrThrow(surveyId: string): Promise<ISurvey> {
  const survey = await Survey.findOne({ id: surveyId });

  if (!survey) {
    throw new AppError(404, 'הסקר לא נמצא');
  }

  return survey;
}

export function verifySurveyOwner(
  survey: { createdBy: string },
  userId: string,
  message = 'אין לך הרשאה לבצע פעולה זו'
): void {
  if (survey.createdBy !== userId) {
    throw new AppError(403, message);
  }
}

export function getAllQuestions(survey: ISurvey): IQuestion[] {
  return survey.sections.flatMap((section) => section.questions);
}
