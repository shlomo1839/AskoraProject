import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import QuestionEditorCard from './QuestionEditorCard';
import type { Section } from '../../types/survey.types';

interface SectionEditorCardProps {
  section: Section;
  sectionIndex: number;
  sections: Section[];
  sectionError?: string;
  questionErrors: Record<string, string>;
  canDelete: boolean;
  onChange: (updatedSection: Section) => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onQuestionChange: (questionIndex: number, updatedQuestion: Section['questions'][number]) => void;
  onDeleteQuestion: (questionIndex: number) => void;
}

export default function SectionEditorCard({
  section,
  sectionIndex,
  sections,
  sectionError,
  questionErrors,
  canDelete,
  onChange,
  onDelete,
  onAddQuestion,
  onQuestionChange,
  onDeleteQuestion,
}: SectionEditorCardProps) {
  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            קטע {sectionIndex + 1}
          </Typography>
          {canDelete && (
            <IconButton color="error" onClick={onDelete} aria-label="מחיקת קטע">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <TextField
          fullWidth
          label="כותרת הקטע"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          error={Boolean(sectionError)}
          helperText={sectionError}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="תיאור הקטע (אופציונלי)"
          value={section.description}
          onChange={(e) => onChange({ ...section, description: e.target.value })}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          שאלות בקטע
        </Typography>

        {section.questions.map((question, questionIndex) => {
          const availableQuestions: Section['questions'] = [];
          for (let i = 0; i <= sectionIndex; i++) {
            const s = sections[i];
            for (let j = 0; j < s.questions.length; j++) {
              if (i === sectionIndex && j >= questionIndex) break;
              if (s.questions[j].type === 'multiple-choice') {
                availableQuestions.push(s.questions[j]);
              }
            }
          }

          return (
            <QuestionEditorCard
              key={question.id}
              question={question}
              index={questionIndex}
              error={questionErrors[question.id]}
              availableQuestions={availableQuestions}
              onChange={(updated) => onQuestionChange(questionIndex, updated)}
              onDelete={() => onDeleteQuestion(questionIndex)}
            />
          );
        })}

        <Button startIcon={<AddIcon />} onClick={onAddQuestion} size="small">
          הוסף שאלה לקטע
        </Button>
      </CardContent>
    </Card>
  );
}
