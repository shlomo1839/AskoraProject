export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
