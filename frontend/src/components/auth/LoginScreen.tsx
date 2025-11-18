import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorNotification } from '../common/ErrorNotification';
import './LoginScreen.css';

export const LoginScreen: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register({ email, password });
      } else {
        await login({ email, password });
      }
      navigate('/home');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              error?: { message?: string };
              message?: string;
            };
          };
        };
        // Try to extract error message from different possible structures
        const errorMessage = 
          axiosError.response?.data?.error?.message ||
          axiosError.response?.data?.message ||
          (axiosError.response?.data as { message?: string })?.message ||
          'An error occurred';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h1 className="login-title">Visual Programming Application</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            {isRegisterMode && (
              <small className="password-hint">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </small>
            )}
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Loading...' : isRegisterMode ? 'Register' : 'Login'}
          </button>
        </form>
        <button
          type="button"
          className="toggle-mode-button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError(null);
          }}
          disabled={loading}
        >
          {isRegisterMode
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </button>
      </div>
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};
