import type { Request } from 'express';
import { Survey, type ISurvey, type IQuestion } from '../models/Survey';
import { AppError } from '../middleware/error.middleware';

// Gets a parameter from the URL as a clean string.
export function getRouteParam(req: Request, paramName: string): string {
  const value = req.params[paramName];
  return Array.isArray(value) ? value[0] : value;
}

// Finds a survey by ID. Throws a 404 error if it does not exist.
export async function findSurveyOrThrow(surveyId: string): Promise<ISurvey> {
  const survey = await Survey.findOne({ id: surveyId });

  if (!survey) {
    throw new AppError(404, 'הסקר לא נמצא');
  }

  return survey;
}

// Checks if the user is the owner of the survey. If not, throws a 403 error.
export function verifySurveyOwner(
  survey: { createdBy: string },
  userId: string,
  message = 'אין לך הרשאה לבצע פעולה זו'
): void {
  if (survey.createdBy !== userId) {
    throw new AppError(403, message);
  }
}

// Returns true when the survey has a deadline that already passed.
export function isSurveyClosed(survey: { closesAt?: Date | null }): boolean {
  return survey.closesAt != null && survey.closesAt.getTime() <= Date.now();
}

// Throws a 403 (with a recognizable code) if the survey deadline has passed.
export function assertSurveyOpen(survey: { closesAt?: Date | null }): void {
  if (isSurveyClosed(survey)) {
    throw new AppError(403, 'הסקר נסגר ולא ניתן עוד להשיב עליו', 'SURVEY_CLOSED');
  }
}

// Puts all questions from all sections into one simple list.
// This makes it easy to find or validate questions without using nested loops.
export function getAllQuestions(survey: ISurvey): IQuestion[] {
  return survey.sections.flatMap((section) => section.questions);
}
