import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import QuestionViewerCard from '../components/survey/QuestionViewerCard';
import { SurveyService } from '../services/surveyService';
import type { ApiError } from '../services/api';
import { getAllQuestions } from '../utils/surveyUtils';
import type { Answer, Question, Survey } from '../types/survey.types';

function findMissingRequired(
  questions: Question[],
  answers: Record<string, string | number | string[]>
): Question | undefined {
  return questions.find((question) => {
    if (!question.isRequired) {
      return false;
    }
    const answer = answers[question.id];
    return answer === undefined || answer === '';
  });
}

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [closed, setClosed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!surveyId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    SurveyService.getSurveyById(surveyId)
      .then(setSurvey)
      .catch((err: ApiError) => {
        if (err?.code === 'SURVEY_CLOSED') {
          setClosed(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (closed) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            הסקר נסגר
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            מועד הסגירה של הסקר חלף ולא ניתן עוד להשיב עליו.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (notFound || !survey) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            הסקר לא נמצא
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ייתכן שהקישור שגוי או שהסקר נמחק.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const { sections } = survey;
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers({ ...answers, [questionId]: value });
    setError('');
  };

  const validateCurrentSection = (): boolean => {
    const missingRequired = findMissingRequired(currentSection.questions, answers);

    if (missingRequired) {
      setError(`יש לענות על השאלה: "${missingRequired.title}"`);
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }

    setCurrentSectionIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) {
      return;
    }

    const allQuestions = getAllQuestions(survey);
    const formattedAnswers: Answer[] = allQuestions
      .filter((question) => answers[question.id] !== undefined)
      .map((question) => ({
        questionId: question.id,
        value: answers[question.id],
      }));

    setSubmitting(true);
    setError('');

    try {
      await SurveyService.submitSurvey(survey.id, formattedAnswers);
      setSubmitted(true);
    } catch (err) {
      if ((err as ApiError)?.code === 'SURVEY_CLOSED') {
        setClosed(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת הסקר');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            תודה על מילוי הסקר!
          </Typography>
          <Typography color="text.secondary">התשובות שלך נשמרו בהצלחה.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {survey.title}
          </Typography>
          {survey.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {survey.description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            קטע {currentSectionIndex + 1} מתוך {sections.length}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {currentSection.title && (
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {currentSection.title}
            </Typography>
          )}
          {currentSection.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {currentSection.description}
            </Typography>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {currentSection.questions.map((question, index) => (
          <QuestionViewerCard
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id] ?? ''}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {isLastSection ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'שולח...' : 'שליחת הסקר'}
            </Button>
          ) : (
            <Button variant="contained" size="large" onClick={handleNext}>
              הבא
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
