import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { SurveyService } from '../services/surveyService';
import { getTotalQuestionCount, getTotalSectionCount } from '../utils/surveyUtils';
import type { Survey } from '../types/survey.types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    SurveyService.getMySurveys()
      .then(setSurveys)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הסקרים');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const showMessage = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleCopyLink = async (surveyId: string) => {
    const surveyUrl = `${window.location.origin}/take-survey/${surveyId}`;
    try {
      await navigator.clipboard.writeText(surveyUrl);
      showMessage('הקישור הועתק בהצלחה');
    } catch {
      showMessage('לא הצלחנו להעתיק את הקישור');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!surveyToDelete) {
      return;
    }

    try {
      await SurveyService.deleteSurvey(surveyToDelete.id);
      setSurveys((prev) => prev.filter((survey) => survey.id !== surveyToDelete.id));
      setSurveyToDelete(null);
      showMessage('הסקר נמחק בהצלחה');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'שגיאה במחיקת הסקר');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            הסקרים שלי
          </Typography>
          <Button variant="contained" onClick={() => navigate('/create-survey')}>
            יצירת סקר חדש
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {surveys.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              עדיין לא יצרת סקרים
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/create-survey')}>
              צור את הסקר הראשון שלך
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {surveys.map((survey) => (
              <Grid key={survey.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {survey.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {survey.description || 'אין תיאור'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`${getTotalSectionCount(survey)} קטעים`} size="small" />
                      <Chip label={`${getTotalQuestionCount(survey)} שאלות`} size="small" />
                      <Chip label={formatDate(survey.createdAt)} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, flexWrap: 'wrap', gap: 0.5 }}>
                    <Button size="small" onClick={() => navigate(`/survey-results/${survey.id}`)}>
                      תוצאות
                    </Button>
                    <Button size="small" onClick={() => navigate(`/edit-survey/${survey.id}`)}>
                      עריכה
                    </Button>
                    <Button size="small" onClick={() => handleCopyLink(survey.id)}>
                      העתק קישור
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/take-survey/${survey.id}`)}
                    >
                      תצוגה מקדימה
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setSurveyToDelete(survey)}
                    >
                      מחיקה
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <ConfirmDialog
        open={Boolean(surveyToDelete)}
        title="מחיקת סקר"
        message={`האם למחוק את הסקר "${surveyToDelete?.title}"? פעולה זו תמחק גם את כל התשובות.`}
        confirmText="מחק"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSurveyToDelete(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
