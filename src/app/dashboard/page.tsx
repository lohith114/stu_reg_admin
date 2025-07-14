'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import { signOut } from 'firebase/auth';
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
  AppBar,
  Toolbar,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, Variants } from 'framer-motion';
import { Logout, Group } from '@mui/icons-material'; // <-- Imported Group icon

// --- Theme Configuration ---
let theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a192f',
      paper: '#112240',
    },
    primary: { main: '#64ffda' },
    secondary: { main: '#f77272' },
    text: {
      primary: '#ccd6f6',
      secondary: '#8892b0',
    },
    success: { main: '#66bb6a' },
    error: { main: '#f44336' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          boxShadow: '0 4px 15px rgba(100, 255, 218, 0.2)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(100, 255, 218, 0.4)',
          },
        },
        containedSecondary: {
          boxShadow: '0 4px 15px rgba(247, 114, 114, 0.2)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(247, 114, 114, 0.4)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          color: '#ffffff',
        },
        standardSuccess: {
          backgroundColor: '#2e7d32',
        },
        standardError: {
          backgroundColor: '#d32f2f',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

// --- Styled Components ---
const AnimatedGradientBackground = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  paddingBottom: '4rem',
  background: 'linear-gradient(45deg, #0a192f, #112240, #0a192f)',
  backgroundSize: '400% 400%',
  animation: 'gradientAnimation 15s ease infinite',
  '@keyframes gradientAnimation': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
});

const StyledFormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: '16px',
  backgroundColor: 'rgba(17, 34, 64, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
  border: '1px solid rgba(100, 255, 218, 0.2)',
}));

const PillTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '50px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'rgba(100, 255, 218, 0.5)' },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '1px',
    },
    '& .MuiInputBase-input': {
      color: '#212B36',
      padding: '16px 22px',
      '&::placeholder': { color: '#8892b0', opacity: 1 },
    },
  },
}));

// --- Framer Motion Variants ---
const formItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};

const formContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// --- Notification Type ---
type NotificationType = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

// --- Dashboard Component ---
export default function Dashboard() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [classField, setClassField] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [notification, setNotification] = useState<NotificationType>({
    open: false,
    message: '',
    severity: 'success',
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      } else {
        setPageLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNums = /^[0-9]*$/;
    if (onlyNums.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const clearForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setSchoolName('');
    setClassField('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const adminEmail = auth.currentUser?.email;
    if (!adminEmail) {
      setNotification({
        open: true,
        message: 'Admin session expired. Please log in again.',
        severity: 'error',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          school_name: schoolName,
          class: classField,
          admin_email: adminEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      setNotification({
        open: true,
        message: data.message || 'Data submitted successfully!',
        severity: 'success',
      });
      clearForm();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleNotificationClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (pageLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatedGradientBackground
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress color="primary" />
        </AnimatedGradientBackground>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedGradientBackground>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            backgroundColor: 'rgba(17, 34, 64, 0.5)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}
            >
              Admin Dashboard
            </Typography>

            {/* --- UPDATED: Added View Users button --- */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Group />}
              onClick={() => router.push('/users')}
              sx={{ mr: 2 }}
            >
              View Users
            </Button>
            
            <Button
              color="secondary"
              variant="contained"
              startIcon={<Logout />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <MuiAlert
            onClose={handleNotificationClose}
            severity={notification.severity}
            variant="standard"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </MuiAlert>
        </Snackbar>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '700px', mx: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StyledFormPaper>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                textAlign="center"
                sx={{ color: 'text.primary' }}
              >
                Enter New Student Data
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box
                  component={motion.div}
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="show"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
                  <motion.div variants={formItemVariants}>
                    <PillTextField
                      fullWidth
                      placeholder="Full Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </motion.div>
                  <motion.div variants={formItemVariants}>
                    <PillTextField
                      fullWidth
                      placeholder="Phone Number *"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </motion.div>
                  <motion.div variants={formItemVariants}>
                    <PillTextField
                      fullWidth
                      placeholder="Email Address *"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </motion.div>
                  <motion.div variants={formItemVariants}>
                    <PillTextField
                      fullWidth
                      placeholder="School Name *"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                    />
                  </motion.div>
                  <motion.div variants={formItemVariants}>
                    <PillTextField
                      fullWidth
                      placeholder="Class *"
                      value={classField}
                      onChange={(e) => setClassField(e.target.value)}
                      required
                    />
                  </motion.div>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 3, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Data'}
                </Button>
              </Box>
            </StyledFormPaper>
          </motion.div>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 4, color: 'text.secondary' }}
          >
            © {new Date().getFullYear()} Jairisys Tech. All rights reserved.
          </Typography>
        </Box>
      </AnimatedGradientBackground>
    </ThemeProvider>
  );
}