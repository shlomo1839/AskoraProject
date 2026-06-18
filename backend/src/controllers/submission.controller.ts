import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { Submission, toPublicSubmission, type IAnswer } from '../models/Submission';
import { findSurveyOrThrow, getRouteParam, verifySurveyOwner } from '../utils/surveyHelpers';
import { validateSubmissionAnswers } from '../utils/validateSubmission';

interface SubmitBody {
  id?: string;
  answers?: IAnswer[];
}

export async function submitSurvey(req: Request, res: Response): Promise<void> {
  const surveyId = getRouteParam(req, 'surveyId');
  const body = req.body as SubmitBody;

  const survey = await findSurveyOrThrow(surveyId);
  const validatedAnswers = validateSubmissionAnswers(survey, body.answers ?? []);

  const submission = await Submission.create({
    id: body.id?.trim() || crypto.randomUUID(),
    surveyId: survey.id,
    answers: validatedAnswers,
    submittedAt: new Date(),
  });

  res.status(201).json({
    message: 'התשובות נשמרו בהצלחה',
    submission: toPublicSubmission(submission),
  });
}

export async function getSurveySubmissions(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = getRouteParam(req, 'surveyId');

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId, 'אין לך הרשאה לצפות בתוצאות של סקר זה');

  const submissions = await Submission.find({ surveyId }).sort({ submittedAt: -1 });

  res.json({
    submissions: submissions.map(toPublicSubmission),
  });
}
