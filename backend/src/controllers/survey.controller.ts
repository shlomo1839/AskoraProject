import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { Survey, toPublicSurvey } from '../models/Survey';
import { SurveyVersion } from '../models/SurveyVersion';
import { Submission } from '../models/Submission';
import { validateSurveyInput } from '../utils/validateSurvey';
import {
  assertSurveyOpen,
  findSurveyOrThrow,
  getRouteParam,
  verifySurveyOwner,
} from '../utils/surveyHelpers';
import { getOptionalUserId } from '../middleware/auth.middleware';
import type { ISection } from '../models/Survey';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../utils/cache';

interface SurveyBody {
  id?: string;
  version?: number;
  title?: string;
  description?: string;
  sections?: ISection[];
  closesAt?: string | null;
}

export async function getMySurveys(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;

  const cacheKey = `surveys:user:${userId}`;
  const cached = await cacheGet<ReturnType<typeof toPublicSurvey>[]>(cacheKey);
  if (cached) {
    res.json({ surveys: cached });
    return;
  }

  const surveys = await Survey.find({ createdBy: userId }).sort({ createdAt: -1 });
  const result = surveys.map(toPublicSurvey);

  await cacheSet(cacheKey, result, 120); // 2 minutes

  res.json({ surveys: result });
}

export async function createSurvey(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const body = req.body as SurveyBody;

  const validated = validateSurveyInput(body);

  const survey = await Survey.create({
    id: body.id?.trim() || crypto.randomUUID(),
    version: 1,
    title: validated.title,
    description: validated.description,
    sections: validated.sections,
    closesAt: validated.closesAt,
    createdBy: userId,
  });

  await SurveyVersion.create({
    surveyId: survey.id,
    version: survey.version,
    title: survey.title,
    description: survey.description,
    sections: survey.sections,
    closesAt: survey.closesAt,
    createdBy: survey.createdBy,
  });

  // Invalidate user's survey list cache
  await cacheDelete(`surveys:user:${userId}`);

  res.status(201).json({
    message: 'הסקר נוצר בהצלחה',
    survey: toPublicSurvey(survey),
  });
}

export async function getSurveyById(req: Request, res: Response): Promise<void> {
  const surveyId = getRouteParam(req, 'id');

  const cacheKey = `survey:${surveyId}`;
  const cached = await cacheGet<ReturnType<typeof toPublicSurvey>>(cacheKey);

  if (cached) {
    // Still need to enforce deadline for non-owners
    const requesterId = getOptionalUserId(req);
    if (cached.createdBy !== requesterId && cached.closesAt && new Date(cached.closesAt).getTime() <= Date.now()) {
      assertSurveyOpen({ closesAt: new Date(cached.closesAt) });
    }
    res.json({ survey: cached });
    return;
  }

  const survey = await findSurveyOrThrow(surveyId);

  // The owner may always load the survey (e.g. to edit or extend the deadline).
  // Respondents are blocked once the deadline has passed.
  const requesterId = getOptionalUserId(req);
  if (survey.createdBy !== requesterId) {
    assertSurveyOpen(survey);
  }

  const result = toPublicSurvey(survey);
  await cacheSet(cacheKey, result, 300); // 5 minutes

  res.json({ survey: result });
}

export async function updateSurvey(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = getRouteParam(req, 'id');
  const body = req.body as SurveyBody;

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  const validated = validateSurveyInput(body);

  survey.version += 1;
  survey.title = validated.title;
  survey.description = validated.description;
  survey.sections = validated.sections;
  survey.closesAt = validated.closesAt;
  await survey.save();

  await SurveyVersion.create({
    surveyId: survey.id,
    version: survey.version,
    title: survey.title,
    description: survey.description,
    sections: survey.sections,
    closesAt: survey.closesAt,
    createdBy: userId,
  });

  // Invalidate related caches
  await cacheDelete(`survey:${surveyId}`);
  await cacheDelete(`surveys:user:${userId}`);
  await cacheDeletePattern(`versions:${surveyId}`);
  await cacheDeletePattern(`version:${surveyId}:*`);

  res.json({
    message: 'הסקר עודכן בהצלחה',
    survey: toPublicSurvey(survey),
  });
}

export async function deleteSurvey(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = getRouteParam(req, 'id');

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  await Submission.deleteMany({ surveyId });
  await SurveyVersion.deleteMany({ surveyId });
  await Survey.deleteOne({ id: surveyId });

  // Invalidate related caches
  await cacheDelete(`survey:${surveyId}`);
  await cacheDelete(`surveys:user:${userId}`);
  await cacheDelete(`submissions:${surveyId}`);
  await cacheDeletePattern(`versions:${surveyId}`);
  await cacheDeletePattern(`version:${surveyId}:*`);

  res.json({
    message: 'הסקר נמחק בהצלחה',
  });
}
