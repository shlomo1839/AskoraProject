import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { SurveyService } from '../../services/surveyService';
import type { SurveyVersion } from '../../types/survey.types';
import QuestionViewerCard from './QuestionViewerCard';
import ConfirmDialog from '../ConfirmDialog';

interface VersionPreviewDialogProps {
  surveyId: string;
  version: number | null;
  open: boolean;
  onClose: () => void;
  onRestore: (versionData: SurveyVersion) => void;
}

export default function VersionPreviewDialog({
  surveyId,
  version,
  open,
  onClose,
  onRestore,
}: VersionPreviewDialogProps) {
  const [data, setData] = useState<SurveyVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && surveyId && version !== null) {
      loadVersionData();
    } else {
      setData(null);
    }
  }, [open, surveyId, version]);

  const loadVersionData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await SurveyService.getSurveyVersion(surveyId, version!);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת נתוני הגרסה');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    setConfirmOpen(false);
    if (data) {
      onRestore(data);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          תצוגה מקדימה - גרסה {version}
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : data ? (
            <Box sx={{ pointerEvents: 'none' /* Make read-only visually */ }}>
              <Typography variant="h5" gutterBottom>
                {data.title}
              </Typography>
              {data.description && (
                <Typography variant="body1" color="text.secondary" component="p" sx={{ mb: 2 }}>
                  {data.description}
                </Typography>
              )}
              <Divider sx={{ mb: 3 }} />
              {data.sections.map((section, sIndex) => (
                <Box key={section.id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    חלק {sIndex + 1}: {section.title}
                  </Typography>
                  {section.description && (
                    <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
                      {section.description}
                    </Typography>
                  )}
                  {section.questions.map((question, qIndex) => (
                    <QuestionViewerCard
                      key={question.id}
                      question={question}
                      index={qIndex}
                      value={''}
                      onChange={() => {}}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose}>סגור</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={loading || !data}
            onClick={handleRestoreClick}
          >
            שחזר לגרסה זו
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="אישור שחזור גרסה"
        message={`האם אתה בטוח שברצונך לשחזר את הסקר לגרסה ${version}? פעולה זו תיצור גרסה חדשה שהיא העתק של גרסה זו ולא תדרוס היסטוריה קיימת.`}
        confirmText="שחזר גרסה"
        onConfirm={handleConfirmRestore}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
