// File: app/users/page.tsx

'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  CircularProgress,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowBack, Edit as EditIcon } from '@mui/icons-material';

// Use the same theme for a consistent look
let theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a192f',
      paper: '#112240',
    },
    primary: {
      main: '#64ffda',
    },
    secondary: {
      main: '#f77272',
    },
    text: {
      primary: '#ccd6f6',
      secondary: '#8892b0',
    },
    success: { main: '#66bb6a' },
    error: { main: '#f44336' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '8px', color: '#ffffff' },
        standardSuccess: { backgroundColor: '#2e7d32' },
        standardError: { backgroundColor: '#d32f2f' },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(136, 146, 176, 0.5)' },
            '&:hover fieldset': { borderColor: '#64ffda' },
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

const AnimatedGradientBackground = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(45deg, #0a192f, #112240, #0a192f)',
  backgroundSize: '400% 400%',
  animation: 'gradientAnimation 15s ease infinite',
  '@keyframes gradientAnimation': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
});

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  school_name: string;
  class: string;
  admin_name: string;
  submission_date: string;
}

type NotificationType = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<NotificationType>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user data.');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user.');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setNotification({ open: true, message: 'User updated successfully!', severity: 'success' });
      handleCloseModal();
    } catch (err: any) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleNotificationClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatedGradientBackground>
        <AppBar position="static" color="transparent" elevation={0} sx={{ backgroundColor: 'rgba(17, 34, 64, 0.5)', backdropFilter: 'blur(5px)' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
              Enrolled Users
            </Typography>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Toolbar>
        </AppBar>

        <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleNotificationClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ mt: 8 }}>
          <Alert onClose={handleNotificationClose} severity={notification.severity} variant="standard" sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : (
            <>
              {users.length > 0 ? (
                <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper', borderRadius: '12px' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>School</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>Class</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', backgroundColor: 'background.paper' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.name}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.phone}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.school_name}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.class}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEditClick(user)}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 4, mt: 4, textAlign: 'center', backgroundColor: 'background.paper' }}>
                  <Typography variant="h6" color="text.primary">No users found.</Typography>
                  <Typography color="text.secondary">Go back to the dashboard to enroll a new user.</Typography>
                </Paper>
              )}
            </>
          )}
        </Box>

        {/* --- UPDATED Edit User Modal with Grid Layout --- */}
        <Dialog open={isModalOpen} onClose={handleCloseModal} PaperProps={{ sx: { backgroundColor: '#112240', borderRadius: '16px' } }} maxWidth="sm" fullWidth>
          <DialogTitle color="primary.main">Edit User Information</DialogTitle>
          <DialogContent>
            {/* The form container is now a responsive grid */}
            <Box
              component="form"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // 1 column on mobile, 2 on desktop
                gap: 2,
                pt: 1,
              }}
            >
              <TextField name="name" label="Full Name" value={editingUser?.name || ''} onChange={handleModalInputChange} />
              <TextField name="email" label="Email" value={editingUser?.email || ''} onChange={handleModalInputChange} />
              <TextField name="phone" label="Phone" value={editingUser?.phone || ''} onChange={handleModalInputChange} />
              <TextField name="school_name" label="School" value={editingUser?.school_name || ''} onChange={handleModalInputChange} />
              {/* This Box makes the "Class" field span the full width of the grid */}
              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <TextField name="class" label="Class" value={editingUser?.class || ''} onChange={handleModalInputChange} fullWidth />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained" color="primary">Update</Button>
          </DialogActions>
        </Dialog>
      </AnimatedGradientBackground>
    </ThemeProvider>
  );
}