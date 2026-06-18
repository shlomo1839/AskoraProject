import {
  Card,
  CardContent,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Button,
} from '@mui/material';
import type { Question } from '../../types/survey.types';

interface QuestionViewerCardProps {
  question: Question;
  index: number;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}

export default function QuestionViewerCard({
  question,
  index,
  value,
  onChange,
}: QuestionViewerCardProps) {
  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {index + 1}. {question.title}
          {question.isRequired && (
            <Typography component="span" color="error.main">
              {' '}
              *
            </Typography>
          )}
        </Typography>

        {question.type === 'open' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="כתוב את תשובתך כאן..."
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            sx={{ mt: 1 }}
          />
        )}

        {question.type === 'multiple-choice' && (
          <FormControl component="fieldset" sx={{ mt: 1, width: '100%' }}>
            <FormLabel component="legend" sx={{ display: 'none' }}>
              {question.title}
            </FormLabel>
            <RadioGroup
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {(question.options ?? []).map((option, optionIndex) => (
                <FormControlLabel
                  key={optionIndex}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {question.type === 'rating' && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => (
              <Button
                key={rating}
                variant={value === rating ? 'contained' : 'outlined'}
                onClick={() => onChange(rating)}
                sx={{ minWidth: 48 }}
              >
                {rating}
              </Button>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
