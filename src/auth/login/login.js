import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/authContext/authContext';

const Login = () => {
  const { isAuthenticated, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName);
        setMessage('Signup successful. Please check your email for verification, then sign in.');
        setMode('signin');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-aurora auth-aurora-left" aria-hidden="true" />
      <div className="auth-aurora auth-aurora-right" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.72, ease: 'easeOut' }}
        className="auth-panel"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="auth-mesh"
          aria-hidden="true"
        />
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="auth-title"
        >
          ClassSync
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="auth-subtitle"
        >
          Academy Portal · Supabase Powered
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="auth-toggle"
        >
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`auth-toggle-button ${mode === 'signin' ? 'is-active' : ''}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`auth-toggle-button ${mode === 'signup' ? 'is-active' : ''}`}
          >
            Sign Up
          </button>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="auth-form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45 }}
        >
          {mode === 'signup' && (
            <div>
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          )}

          <div>
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div>
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="auth-input"
            />
          </div>

          {error && <p className="auth-alert auth-alert-error">{error}</p>}
          {message && <p className="auth-alert auth-alert-success">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="auth-submit"
          >
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </motion.form>
      </motion.div>
    </main>
  );
};

export default Login;
