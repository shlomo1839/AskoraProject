import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { Survey, toPublicSurvey } from '../models/Survey';
import { Submission } from '../models/Submission';
import { validateSurveyInput } from '../utils/validateSurvey';
import {
  findSurveyOrThrow,
  getRouteParam,
  verifySurveyOwner,
} from '../utils/surveyHelpers';
import type { ISection } from '../models/Survey';

interface SurveyBody {
  id?: string;
  title?: string;
  description?: string;
  sections?: ISection[];
}

export async function getMySurveys(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;

  const surveys = await Survey.find({ createdBy: userId }).sort({ createdAt: -1 });

  res.json({
    surveys: surveys.map(toPublicSurvey),
  });
}

export async function createSurvey(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const body = req.body as SurveyBody;

  const validated = validateSurveyInput(body);

  const survey = await Survey.create({
    id: body.id?.trim() || crypto.randomUUID(),
    title: validated.title,
    description: validated.description,
    sections: validated.sections,
    createdBy: userId,
  });

  res.status(201).json({
    message: 'הסקר נוצר בהצלחה',
    survey: toPublicSurvey(survey),
  });
}

export async function getSurveyById(req: Request, res: Response): Promise<void> {
  const survey = await findSurveyOrThrow(getRouteParam(req, 'id'));

  res.json({
    survey: toPublicSurvey(survey),
  });
}

export async function updateSurvey(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const surveyId = getRouteParam(req, 'id');
  const body = req.body as SurveyBody;

  const survey = await findSurveyOrThrow(surveyId);
  verifySurveyOwner(survey, userId);

  const validated = validateSurveyInput(body);

  survey.title = validated.title;
  survey.description = validated.description;
  survey.sections = validated.sections;
  await survey.save();

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
  await Survey.deleteOne({ id: surveyId });

  res.json({
    message: 'הסקר נמחק בהצלחה',
  });
}
