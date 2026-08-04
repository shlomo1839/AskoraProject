import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { Survey, toPublicSurvey } from '../models/Survey';
import { SurveyVersion, toPublicSurveyVersion } from '../models/SurveyVersion';
import { findSurveyOrThrow, verifySurveyOwner } from '../utils/surveyHelpers';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../utils/cache';

export async function getSurveyVersions(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = req.params.id as string;

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  const cacheKey = `versions:${surveyId}`;
  const cached = await cacheGet<{ version: number; createdAt: string; createdBy: string }[]>(cacheKey);
  if (cached) {
    res.json({ versions: cached });
    return;
  }

  // Fetch only metadata to save bandwidth
  const versions = await SurveyVersion.find({ surveyId })
    .select('version createdAt createdBy')
    .sort({ version: -1 });

  const result = versions.map((v) => ({
    version: v.version,
    createdAt: v.createdAt.toISOString(),
    createdBy: v.createdBy,
  }));

  await cacheSet(cacheKey, result, 300); // 5 minutes

  res.json({ versions: result });
}

export async function getSurveyVersion(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = req.params.id as string;
  const versionNumber = parseInt(req.params.version as string, 10);

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  const cacheKey = `version:${surveyId}:${versionNumber}`;
  const cached = await cacheGet<ReturnType<typeof toPublicSurveyVersion>>(cacheKey);
  if (cached) {
    res.json({ surveyVersion: cached });
    return;
  }

  const surveyVersion = await SurveyVersion.findOne({ surveyId, version: versionNumber });
  if (!surveyVersion) {
    res.status(404).json({ error: 'גרסה לא נמצאה' });
    return;
  }

  const result = toPublicSurveyVersion(surveyVersion);
  await cacheSet(cacheKey, result, 600); // 10 minutes

  res.json({ surveyVersion: result });
}

export async function restoreSurveyVersion(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = req.params.id as string;
  const versionNumber = parseInt(req.params.version as string, 10);

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  const surveyVersion = await SurveyVersion.findOne({ surveyId, version: versionNumber });
  if (!surveyVersion) {
    res.status(404).json({ error: 'גרסה לא נמצאה' });
    return;
  }

  // Restore linearly: increment version and apply target version's data
  survey.version += 1;
  survey.title = surveyVersion.title;
  survey.description = surveyVersion.description;
  survey.sections = surveyVersion.sections;
  survey.closesAt = surveyVersion.closesAt;
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
  await cacheDelete(`versions:${surveyId}`);
  await cacheDeletePattern(`version:${surveyId}:*`);

  res.json({
    message: 'הגרסה שוחזרה בהצלחה',
    survey: toPublicSurvey(survey),
  });
}
