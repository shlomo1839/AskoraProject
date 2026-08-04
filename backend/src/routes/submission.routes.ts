import { Router } from 'express';
import {
  exportSurveySubmissionsCsv,
  getSurveySubmissions,
  submitSurvey,
} from '../controllers/submission.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/surveys/:surveyId/submissions', submitSurvey);
router.get('/surveys/:surveyId/submissions/export/csv', requireAuth, exportSurveySubmissionsCsv);
router.get('/surveys/:surveyId/submissions', requireAuth, getSurveySubmissions);

export default router;
