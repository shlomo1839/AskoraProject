import { Router } from 'express';
import {
  createSurvey,
  deleteSurvey,
  duplicateSurvey,
  getMySurveys,
  getSurveyById,
  updateSurvey,
} from '../controllers/survey.controller';
import {
  getSurveyVersion,
  getSurveyVersions,
  restoreSurveyVersion,
} from '../controllers/surveyVersion.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/surveys', requireAuth, getMySurveys);
router.post('/surveys', requireAuth, createSurvey);
router.post('/surveys/:id/duplicate', requireAuth, duplicateSurvey);
router.get('/surveys/:id', getSurveyById);
router.put('/surveys/:id', requireAuth, updateSurvey);
router.delete('/surveys/:id', requireAuth, deleteSurvey);

router.get('/surveys/:id/versions', requireAuth, getSurveyVersions);
router.get('/surveys/:id/versions/:version', requireAuth, getSurveyVersion);
router.post('/surveys/:id/versions/:version/restore', requireAuth, restoreSurveyVersion);

export default router;
