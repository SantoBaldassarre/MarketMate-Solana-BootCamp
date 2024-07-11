import React, { useEffect, useState } from 'react';
import { auth, db, doc, getDoc } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import SolanaWallet from '../components/SolanaWallet';
import { Box, Container, Typography, Grid } from '@mui/material';
import UserDashboard from './UserDashboard';
import BusinessOwnerDashboard from './BusinessOwnerDashboard';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  if (!user) {
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            You must be logged in to view this page.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Dashboard 
        </Typography>
        {user && (
          <Typography variant="h5" gutterBottom>
            {user.email} ({role})
          </Typography>
        )}
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box sx={{ maxWidth: '350px', margin: '0 auto' }}>
              <SolanaWallet />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            {role === 'user' && <UserDashboard />}
            {role === 'business-owner' && <BusinessOwnerDashboard />}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
