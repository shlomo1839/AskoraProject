import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Question, QuestionType } from '../../types/survey.types';

interface QuestionEditorCardProps {
  question: Question;
  index: number;
  error?: string;
  availableQuestions: Question[];
  onChange: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

export default function QuestionEditorCard({
  question,
  index,
  error,
  availableQuestions,
  onChange,
  onDelete,
}: QuestionEditorCardProps) {
  const handleTitleChange = (title: string) => {
    onChange({ ...question, title });
  };

  const handleTypeChange = (type: QuestionType) => {
    const updatedQuestion: Question = { ...question, type };

    if (type === 'multiple-choice') {
      updatedQuestion.options = question.options ?? ['', ''];
    } else {
      updatedQuestion.options = undefined;
    }

    onChange(updatedQuestion);
  };

  const handleRequiredChange = (isRequired: boolean) => {
    onChange({ ...question, isRequired });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const currentOptions = question.options ?? [];
    const updatedOptions = currentOptions.map((option, i) =>
      i === optionIndex ? value : option
    );
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const currentOptions = question.options ?? [];
    onChange({ ...question, options: [...currentOptions, ''] });
  };

  const handleRemoveOption = (optionIndex: number) => {
    const currentOptions = question.options ?? [];
    const updatedOptions = currentOptions.filter((_, i) => i !== optionIndex);
    onChange({ ...question, options: updatedOptions });
  };

  const handleDependsOnChange = (questionId: string) => {
    if (!questionId) {
      onChange({ ...question, dependsOn: null });
    } else {
      const depQ = availableQuestions.find((q) => q.id === questionId);
      const defaultValue = depQ?.options?.[0] || '';
      onChange({ ...question, dependsOn: { questionId, value: defaultValue } });
    }
  };

  const handleDependsOnValueChange = (value: string) => {
    if (question.dependsOn) {
      onChange({ ...question, dependsOn: { ...question.dependsOn, value } });
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            שאלה {index + 1}
          </Typography>
          <IconButton color="error" onClick={onDelete} aria-label="מחיקת שאלה">
            <DeleteIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          label="נוסח השאלה"
          value={question.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>סוג שאלה</InputLabel>
            <Select
              value={question.type}
              label="סוג שאלה"
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            >
              <MenuItem value="open">שאלה פתוחה</MenuItem>
              <MenuItem value="multiple-choice">בחירה יחידה (רדיו)</MenuItem>
              <MenuItem value="rating">דירוג 1-10</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={question.isRequired}
                onChange={(e) => handleRequiredChange(e.target.checked)}
              />
            }
            label="שאלה חובה"
          />
        </Box>

        {question.type === 'multiple-choice' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              אפשרויות בחירה:
            </Typography>
            {(question.options ?? []).map((option, optionIndex) => (
              <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={`אפשרות ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveOption(optionIndex)}
                  disabled={(question.options ?? []).length <= 2}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddOption} size="small">
              הוסף אפשרות
            </Button>
          </Box>
        )}

        {question.type === 'rating' && (
          <Typography variant="body2" color="text.secondary">
            המשיבים ידרגו את התשובה בסולם של 1 עד 10
          </Typography>
        )}

        {question.type === 'open' && (
          <Typography variant="body2" color="text.secondary">
            המשיבים יוכלו לכתוב תשובה חופשית
          </Typography>
        )}

        {availableQuestions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              תלות בשאלה קודמת (אופציונלי)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>הצג רק אם השאלה...</InputLabel>
                <Select
                  value={question.dependsOn?.questionId || ''}
                  label="הצג רק אם השאלה..."
                  onChange={(e) => handleDependsOnChange(e.target.value)}
                >
                  <MenuItem value=""><em>ללא תלות</em></MenuItem>
                  {availableQuestions.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.title || 'שאלה ללא כותרת'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {question.dependsOn?.questionId && (
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel>שווה לתשובה...</InputLabel>
                  <Select
                    value={question.dependsOn.value || ''}
                    label="שווה לתשובה..."
                    onChange={(e) => handleDependsOnValueChange(e.target.value)}
                  >
                    {(() => {
                      const depQ = availableQuestions.find((q) => q.id === question.dependsOn?.questionId);
                      if (!depQ) return null;
                      
                      const validOptions = (depQ.options || []).filter(opt => opt.trim() !== '');
                      const uniqueOptions = Array.from(new Set(validOptions));
                      
                      if (uniqueOptions.length === 0) {
                        return (
                          <MenuItem disabled value="">
                            <em>אנא הוסף תחילה תשובות לשאלה המקורית</em>
                          </MenuItem>
                        );
                      }

                      // If the current value is not in uniqueOptions (e.g. because it was left empty originally),
                      // we need a hidden empty MenuItem so MUI doesn't complain about out-of-range value.
                      return [
                        <MenuItem key="hidden-empty" value="" style={{ display: 'none' }} />,
                        ...uniqueOptions.map((opt, i) => (
                          <MenuItem key={i} value={opt}>
                            {opt}
                          </MenuItem>
                        ))
                      ];
                    })()}
                  </Select>
                </FormControl>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}