import { Router } from 'express';
import {
  createSurvey,
  deleteSurvey,
  getMySurveys,
  getSurveyById,
  updateSurvey,
} from '../controllers/survey.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/surveys', requireAuth, getMySurveys);
router.post('/surveys', requireAuth, createSurvey);
router.get('/surveys/:id', getSurveyById);
router.put('/surveys/:id', requireAuth, updateSurvey);
router.delete('/surveys/:id', requireAuth, deleteSurvey);

export default router;
