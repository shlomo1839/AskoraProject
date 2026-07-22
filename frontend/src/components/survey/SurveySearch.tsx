import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export type SurveyStatusFilter = 'ALL' | 'OPEN' | 'CLOSED';

interface SurveySearchProps {
  searchQuery: string;
  statusFilter: SurveyStatusFilter;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: SurveyStatusFilter) => void;
}

export default function SurveySearch({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: SurveySearchProps) {
  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as SurveyStatusFilter);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center',
        mb: 3,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="חיפוש סקר לפי כותרת או תיאור..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        size="small"
      />

      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
        <InputLabel id="survey-status-select-label">סינון לפי מצב</InputLabel>
        <Select
          labelId="survey-status-select-label"
          id="survey-status-select"
          value={statusFilter}
          label="סינון לפי מצב"
          onChange={handleStatusChange}
        >
          <MenuItem value="ALL">הכל</MenuItem>
          <MenuItem value="OPEN">פתוח</MenuItem>
          <MenuItem value="CLOSED">סגור</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
