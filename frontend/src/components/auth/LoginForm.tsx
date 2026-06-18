import { useState, type FormEvent } from 'react';
import { Box, TextField, Button, Link, Alert } from '@mui/material';
import type { LoginFormData } from '../../types/auth.types';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSubmit: (data: LoginFormData) => Promise<string | null>;
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function LoginForm({ onSwitchToRegister, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!email.trim()) {
      setEmailError('יש להזין אימייל');
      hasError = true;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('כתובת אימייל לא תקינה');
      hasError = true;
    }

    if (!password) {
      setPasswordError('יש להזין סיסמה');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    const validationError = await onSubmit({ email, password });
    if (validationError) {
      setError(validationError);
    }

    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        label="כתובת אימייל"
        autoFocus
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) {
            setEmailError('');
          }
        }}
        error={Boolean(emailError)}
        helperText={emailError}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="סיסמה"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) {
            setPasswordError('');
          }
        }}
        error={Boolean(passwordError)}
        helperText={passwordError}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? 'מתחבר...' : 'התחברות'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component="button" type="button" variant="body2" onClick={onSwitchToRegister}>
          אין לך חשבון? להרשמה
        </Link>
      </Box>
    </Box>
  );
}
