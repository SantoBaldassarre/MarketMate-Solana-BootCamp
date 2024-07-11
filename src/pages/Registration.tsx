import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  db, 
  doc, 
  setDoc, 
  signInWithPopup, 
  GoogleAuthProvider,
  getDoc 
} from '../firebase';
import { Container, TextField, Button, Select, MenuItem, Typography, Alert, Paper } from '@mui/material';

const Registration: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('user');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Component mounted or updated');
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Reset error state
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    try {
      console.log('Creating user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Saving role in Firestore...');
      // Save the role in Firestore
      await setDoc(doc(db, 'users', user.uid), { role, email });

      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('The email address is already in use by another account.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), { role: 'user', email: user.email });
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      setError('An error occurred during Google sign-in. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Registration
        </Typography>
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as string)}
            fullWidth
            variant="outlined"
            margin="dense"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="business-owner">Business Owner</MenuItem>
          </Select>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Register
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            sx={{ marginTop: 2 }} 
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Registration;
