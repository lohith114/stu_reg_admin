'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { LockOpen as LockOpenIcon } from '@mui/icons-material';

// Create a responsive theme with a modern, dark palette
let theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a192f',
      paper: '#112240',
    },
    primary: {
      main: '#64ffda', // neon teal
    },
    text: {
      primary: '#ccd6f6',
      secondary: '#8892b0',
    },
    error: {
      main: '#f77272',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(100, 255, 218, 0.2)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 20px rgba(100, 255, 218, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#ccd6f6',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(136, 146, 176, 0.5)',
            },
            '&:hover fieldset': {
              borderColor: '#64ffda',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#64ffda',
              boxShadow: '0 0 0 3px rgba(100, 255, 218, 0.2)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8892b0',
          },
          '& .Mui-focused .MuiInputLabel-root': {
            color: '#64ffda',
          }
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

// A styled Box component for the background with an animated gradient
const AnimatedGradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(45deg, #0a192f, #112240, #0a192f)',
  backgroundSize: '400% 400%',
  animation: 'gradientAnimation 15s ease infinite',

  // Keyframe animation for the background gradient
  '@keyframes gradientAnimation': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

// The main login form container with enhanced glassmorphism and responsiveness
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 6),
  },
  borderRadius: '16px',
  width: '100%',
  maxWidth: '450px',
  backgroundColor: 'rgba(17, 34, 64, 0.8)', // Glass effect
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
  color: theme.palette.text.primary,
  border: '1px solid rgba(100, 255, 218, 0.2)',
}));

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = 'Login failed. Please check your credentials.';
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Variants for staggered animations with Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedGradientBackground>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <StyledPaper elevation={12}>
            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ textAlign: 'center', mb: 4 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1 }}>
                 <LockOpenIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                 <Typography
                    variant="h1"
                    sx={{
                      color: 'primary.main',
                      textShadow: '0 0 12px rgba(100, 255, 218, 0.5)',
                    }}
                  >
                    Admin Login
                  </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Sign in to access the dashboard
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <motion.div variants={itemVariants}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="email"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="current-password"
                />
              </motion.div>
              {error && (
                <motion.div variants={itemVariants}>
                  <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    {error}
                  </Typography>
                </motion.div>
              )}
              <motion.div variants={itemVariants} style={{ marginTop: '8px' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>
            </Box>

            <motion.div variants={itemVariants}>
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 5, color: 'text.secondary' }}
              >
                © {new Date().getFullYear()} Jairisys Tech. All rights reserved.
              </Typography>
            </motion.div>
          </StyledPaper>
        </motion.div>
      </AnimatedGradientBackground>
    </ThemeProvider>
  );
}