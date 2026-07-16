import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { AuthStorage } from '../services/authStorage';
import { AuthService } from '../services/authService';
import type { LoginFormData, RegisterFormData } from '../types/auth.types';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (AuthStorage.isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSubmit = async (data: LoginFormData): Promise<string | null> => {
    try {
      const response = await AuthService.login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      AuthStorage.setAuth(response.user, response.token);
      navigate('/dashboard');
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'שגיאה בהתחברות';
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData): Promise<string | null> => {
    try {
      const response = await AuthService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      AuthStorage.setAuth(response.user, response.token);
      navigate('/dashboard');
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'שגיאה בהרשמה';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          ברוך הבא לאסקורה
        </Typography>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              {isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}
            </Typography>

            {isLogin ? (
              <LoginForm
                onSwitchToRegister={() => setIsLogin(false)}
                onSubmit={handleLoginSubmit}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setIsLogin(true)}
                onSubmit={handleRegisterSubmit}
              />
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
