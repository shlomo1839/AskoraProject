import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon, History as HistoryIcon } from '@mui/icons-material';
import { SurveyService } from '../../services/surveyService';
import type { SurveyVersionMetadata } from '../../types/survey.types';

interface VersionHistoryDialogProps {
  surveyId: string;
  open: boolean;
  onClose: () => void;
  onSelectVersion: (version: number) => void;
}

export default function VersionHistoryDialog({
  surveyId,
  open,
  onClose,
  onSelectVersion,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<SurveyVersionMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && surveyId) {
      loadVersions();
    }
  }, [open, surveyId]);

  const loadVersions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await SurveyService.getSurveyVersions(surveyId);
      setVersions(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת היסטוריית גרסאות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          היסטוריית גרסאות
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : versions.length === 0 ? (
          <Typography align="center" color="text.secondary">
            לא נמצאו גרסאות קודמות.
          </Typography>
        ) : (
          <List>
            {versions.map((v, index) => (
              <ListItem key={v.version} disablePadding>
                <ListItemButton onClick={() => onSelectVersion(v.version)}>
                  <ListItemText
                    primary={`גרסה ${v.version} ${index === 0 ? '(נוכחית)' : ''}`}
                    secondary={new Date(v.createdAt).toLocaleString('he-IL')}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
