import { api } from './api';
import type { Answer, Survey, SurveySubmission } from '../types/survey.types';

interface SurveyPayload {
  id?: string;
  title: string;
  description: string;
  sections: Survey['sections'];
  closesAt?: string | null;
}

export const SurveyService = {
  async getMySurveys(): Promise<Survey[]> {
    const response = await api.get<{ surveys: Survey[] }>('/api/surveys');
    return response.data.surveys;
  },

  async createSurvey(payload: SurveyPayload): Promise<Survey> {
    const response = await api.post<{ survey: Survey }>('/api/surveys', payload);
    return response.data.survey;
  },

  async updateSurvey(surveyId: string, payload: SurveyPayload): Promise<Survey> {
    const response = await api.put<{ survey: Survey }>(`/api/surveys/${surveyId}`, payload);
    return response.data.survey;
  },

  async deleteSurvey(surveyId: string): Promise<void> {
    await api.delete(`/api/surveys/${surveyId}`);
  },

  async getSurveyById(surveyId: string): Promise<Survey> {
    const response = await api.get<{ survey: Survey }>(`/api/surveys/${surveyId}`);
    return response.data.survey;
  },

  async submitSurvey(surveyId: string, answers: Answer[]): Promise<void> {
    await api.post(`/api/surveys/${surveyId}/submissions`, { answers });
  },

  async getSurveySubmissions(surveyId: string): Promise<SurveySubmission[]> {
    const response = await api.get<{ submissions: SurveySubmission[] }>(
      `/api/surveys/${surveyId}/submissions`
    );
    return response.data.submissions;
  },
};
