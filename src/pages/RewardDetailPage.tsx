import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../firebase';
import { Container, Typography, Paper, Box } from '@mui/material';

const RewardDetailPage = () => {
  const { id, index } = useParams();
  const [reward, setReward] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.rewards && data.rewards[index]) {
            setReward(data.rewards[index]);
          } else {
            setError('Reward not found');
          }
        } else {
          setError('Business owner not found');
        }
      } catch (error) {
        setError('Error fetching reward');
        console.error('Error fetching reward:', error);
      }
    };

    fetchReward();
  }, [id, index]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!reward) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          {reward.title}
        </Typography>
        <Box sx={{ width: '100%', maxHeight: '600px', overflowY: 'auto' }}>
          <Typography variant="body1" gutterBottom>
            Points: {reward.points}
          </Typography>
          {reward.image && <img src={reward.image} alt="Reward" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px', borderRadius: '8px' }} />}
        </Box>
      </Paper>
    </Container>
  );
};

export default RewardDetailPage;
