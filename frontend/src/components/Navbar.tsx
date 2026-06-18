import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthStorage } from '../services/authStorage';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = AuthStorage.getCurrentUser();

  const handleLogout = () => {
    AuthStorage.logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          מערכת סקרים
        </Typography>

        {currentUser && (
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            שלום, {currentUser.name}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}
          >
            לוח בקרה
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/create-survey')}
            sx={{ fontWeight: isActive('/create-survey') ? 'bold' : 'normal' }}
          >
            סקר חדש
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            התנתקות
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
