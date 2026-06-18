import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthStorage } from '../services/authStorage';

export default function NotFound() {
  const navigate = useNavigate();
  const isLoggedIn = AuthStorage.isLoggedIn();

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
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            404
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            הדף לא נמצא
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            הכתובת שחיפשת לא קיימת במערכת.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
          >
            {isLoggedIn ? 'חזרה ללוח הבקרה' : 'חזרה להתחברות'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
