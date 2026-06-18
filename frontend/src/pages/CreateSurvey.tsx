import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import SectionEditorCard from '../components/survey/SectionEditorCard';
import SurveyLinkDialog from '../components/survey/SurveyLinkDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { AuthStorage } from '../services/authStorage';
import { SurveyService } from '../services/surveyService';
import { createEmptyQuestion, createEmptySection } from '../utils/surveyUtils';
import type { Question, Section } from '../types/survey.types';

export default function CreateSurvey() {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const isEditMode = Boolean(surveyId);

  const currentUser = AuthStorage.getCurrentUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([createEmptySection()]);
  const [titleError, setTitleError] = useState('');
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savedSurveyId, setSavedSurveyId] = useState('');
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<{
    sectionIndex: number;
    questionIndex: number;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode || !surveyId) {
      return;
    }

    const user = AuthStorage.getCurrentUser();
    if (!user) {
      return;
    }

    SurveyService.getSurveyById(surveyId)
      .then((existingSurvey) => {
        if (existingSurvey.createdBy !== user.id) {
          setGeneralError('אין לך הרשאה לערוך סקר זה');
          return;
        }

        setTitle(existingSurvey.title);
        setDescription(existingSurvey.description);
        setSections(existingSurvey.sections);
      })
      .catch(() => setGeneralError('הסקר לא נמצא'))
      .finally(() => setLoading(false));
  }, [isEditMode, surveyId]);

  const handleSectionChange = (sectionIndex: number, updatedSection: Section) => {
    const updatedSections = sections.map((section, i) =>
      i === sectionIndex ? updatedSection : section
    );
    setSections(updatedSections);

    if (sectionErrors[updatedSection.id]) {
      const updatedErrors = { ...sectionErrors };
      delete updatedErrors[updatedSection.id];
      setSectionErrors(updatedErrors);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, createEmptySection()]);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    if (sections.length === 1) {
      return;
    }
    setSectionToDelete(sectionIndex);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete === null) {
      return;
    }

    setSections(sections.filter((_, i) => i !== sectionToDelete));
    setSectionToDelete(null);
  };

  const handleAddQuestion = (sectionIndex: number) => {
    const updatedSections = sections.map((section, i) => {
      if (i !== sectionIndex) {
        return section;
      }
      return {
        ...section,
        questions: [...section.questions, createEmptyQuestion()],
      };
    });
    setSections(updatedSections);
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: Question
  ) => {
    const updatedSections = sections.map((section, i) => {
      if (i !== sectionIndex) {
        return section;
      }
      return {
        ...section,
        questions: section.questions.map((q, qi) =>
          qi === questionIndex ? updatedQuestion : q
        ),
      };
    });
    setSections(updatedSections);

    if (questionErrors[updatedQuestion.id]) {
      const updatedErrors = { ...questionErrors };
      delete updatedErrors[updatedQuestion.id];
      setQuestionErrors(updatedErrors);
    }
  };

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const section = sections[sectionIndex];
    if (section.questions.length === 1) {
      return;
    }
    setQuestionToDelete({ sectionIndex, questionIndex });
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) {
      return;
    }

    const { sectionIndex, questionIndex } = questionToDelete;
    const updatedSections = sections.map((section, i) => {
      if (i !== sectionIndex) {
        return section;
      }
      return {
        ...section,
        questions: section.questions.filter((_, qi) => qi !== questionIndex),
      };
    });
    setSections(updatedSections);
    setQuestionToDelete(null);
  };

  const validateForm = (): boolean => {
    setGeneralError('');
    setTitleError('');
    setSectionErrors({});
    setQuestionErrors({});

    let isValid = true;
    const newSectionErrors: Record<string, string> = {};
    const newQuestionErrors: Record<string, string> = {};

    if (!title.trim()) {
      setTitleError('יש להזין כותרת לסקר');
      isValid = false;
    }

    sections.forEach((section) => {
      if (!section.title.trim()) {
        newSectionErrors[section.id] = 'יש להזין כותרת לקטע';
        isValid = false;
      }

      if (section.questions.length === 0) {
        newSectionErrors[section.id] = 'יש להוסיף לפחות שאלה אחת לקטע';
        isValid = false;
      }

      section.questions.forEach((question) => {
        if (!question.title.trim()) {
          newQuestionErrors[question.id] = 'יש למלא את נוסח השאלה';
          isValid = false;
        }

        if (
          question.type === 'multiple-choice' &&
          (question.options ?? []).some((option) => !option.trim())
        ) {
          newQuestionErrors[question.id] = 'יש למלא את כל אפשרויות הבחירה';
          isValid = false;
        }
      });
    });

    if (Object.keys(newSectionErrors).length > 0) {
      setSectionErrors(newSectionErrors);
    }
    if (Object.keys(newQuestionErrors).length > 0) {
      setQuestionErrors(newQuestionErrors);
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      setGeneralError('יש להתחבר כדי ליצור סקר');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      sections,
    };

    setSaving(true);
    setGeneralError('');

    try {
      if (isEditMode && surveyId) {
        await SurveyService.updateSurvey(surveyId, payload);
        setSnackbarOpen(true);
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }

      const created = await SurveyService.createSurvey({
        ...payload,
        id: crypto.randomUUID(),
      });

      setSavedSurveyId(created.id);
      setDialogOpen(true);
      setTitle('');
      setDescription('');
      setSections([createEmptySection()]);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'שגיאה בשמירת הסקר');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">טוען סקר...</Typography>
        </Container>
      </AppLayout>
    );
  }

  if (generalError && isEditMode && !title) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            חזרה ללוח הבקרה
          </Button>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          חזרה ללוח הבקרה
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'עריכת סקר' : 'יצירת סקר חדש'}
        </Typography>

        {generalError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {generalError}
          </Alert>
        )}

        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="כותרת הסקר"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) {
                setTitleError('');
              }
            }}
            error={Boolean(titleError)}
            helperText={titleError}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="תיאור הסקר (אופציונלי)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          קטעים
        </Typography>

        {sections.map((section, sectionIndex) => (
          <SectionEditorCard
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            sectionError={sectionErrors[section.id]}
            questionErrors={questionErrors}
            canDelete={sections.length > 1}
            onChange={(updated) => handleSectionChange(sectionIndex, updated)}
            onDelete={() => handleDeleteSection(sectionIndex)}
            onAddQuestion={() => handleAddQuestion(sectionIndex)}
            onQuestionChange={(qi, updated) =>
              handleQuestionChange(sectionIndex, qi, updated)
            }
            onDeleteQuestion={(qi) => handleDeleteQuestion(sectionIndex, qi)}
          />
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddSection} sx={{ mb: 3 }}>
          הוסף קטע
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" size="large" onClick={handleSubmit} disabled={saving}>
            {saving ? 'שומר...' : isEditMode ? 'שמירת שינויים' : 'פרסום הסקר'}
          </Button>
        </Box>

        <SurveyLinkDialog
          open={dialogOpen}
          surveyId={savedSurveyId}
          onClose={() => setDialogOpen(false)}
        />

        <ConfirmDialog
          open={sectionToDelete !== null}
          title="מחיקת קטע"
          message="האם למחוק את הקטע? כל השאלות בקטע יימחקו."
          confirmText="מחק"
          onConfirm={confirmDeleteSection}
          onCancel={() => setSectionToDelete(null)}
        />

        <ConfirmDialog
          open={questionToDelete !== null}
          title="מחיקת שאלה"
          message="האם למחוק את השאלה?"
          confirmText="מחק"
          onConfirm={confirmDeleteQuestion}
          onCancel={() => setQuestionToDelete(null)}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            הסקר עודכן בהצלחה
          </Alert>
        </Snackbar>
      </Container>
    </AppLayout>
  );
}
