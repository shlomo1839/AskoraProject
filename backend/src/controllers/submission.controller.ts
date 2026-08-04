import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { Submission, toPublicSubmission, type IAnswer } from '../models/Submission';
import {
  assertSurveyOpen,
  findSurveyOrThrow,
  getRouteParam,
  verifySurveyOwner,
} from '../utils/surveyHelpers';
import { validateSubmissionAnswers } from '../utils/validateSubmission';
import { cacheGet, cacheSet, cacheDelete } from '../utils/cache';
import { buildCsvFilename, buildSubmissionsCsv } from '../utils/csvExport';

interface SubmitBody {
  id?: string;
  answers?: IAnswer[];
}

export async function submitSurvey(req: Request, res: Response): Promise<void> {
  const surveyId = getRouteParam(req, 'surveyId');
  const body = req.body as SubmitBody;

  const survey = await findSurveyOrThrow(surveyId);

  // Re-check the deadline at submit time, in case it passed while answering.
  assertSurveyOpen(survey);

  const validatedAnswers = validateSubmissionAnswers(survey, body.answers ?? []);

  const submission = await Submission.create({
    id: body.id?.trim() || crypto.randomUUID(),
    surveyId: survey.id,
    answers: validatedAnswers,
    submittedAt: new Date(),
  });

  // Invalidate submissions cache for this survey
  await cacheDelete(`submissions:${surveyId}`);

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

  const cacheKey = `submissions:${surveyId}`;
  const cached = await cacheGet<ReturnType<typeof toPublicSubmission>[]>(cacheKey);
  if (cached) {
    res.json({ submissions: cached });
    return;
  }

  const submissions = await Submission.find({ surveyId }).sort({ submittedAt: -1 });
  const result = submissions.map(toPublicSubmission);

  await cacheSet(cacheKey, result, 120); // 2 minutes

  res.json({ submissions: result });
}

export async function exportSurveySubmissionsCsv(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = getRouteParam(req, 'surveyId');

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId, 'אין לך הרשאה לצפות בתוצאות של סקר זה');

  const submissions = await Submission.find({ surveyId }).sort({ submittedAt: -1 });
  const csv = buildSubmissionsCsv(survey, submissions);
  const filename = buildCsvFilename(survey.title);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
