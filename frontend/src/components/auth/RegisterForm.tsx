import { useState, type FormEvent } from 'react';
import { Box, TextField, Button, Link, Alert } from '@mui/material';
import type { RegisterFormData } from '../../types/auth.types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSubmit: (data: RegisterFormData) => Promise<string | null>;
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function RegisterForm({ onSwitchToLogin, onSubmit }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (!name.trim()) {
      setNameError('יש להזין שם מלא');
      hasError = true;
    }

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
    } else if (password.length < 6) {
      setPasswordError('הסיסמה חייבת להכיל לפחות 6 תווים');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('יש לאמת את הסיסמה');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('הסיסמאות אינן תואמות');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    const validationError = await onSubmit({ name, email, password, confirmPassword });
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
        label="שם מלא"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (nameError) {
            setNameError('');
          }
        }}
        error={Boolean(nameError)}
        helperText={nameError}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="כתובת אימייל"
        type="email"
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
      <TextField
        margin="normal"
        required
        fullWidth
        label="אימות סיסמה"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmPasswordError) {
            setConfirmPasswordError('');
          }
        }}
        error={Boolean(confirmPasswordError)}
        helperText={confirmPasswordError}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? 'נרשם...' : 'הרשמה'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component="button" type="button" variant="body2" onClick={onSwitchToLogin}>
          כבר יש לך חשבון? להתחברות
        </Link>
      </Box>
    </Box>
  );
}
