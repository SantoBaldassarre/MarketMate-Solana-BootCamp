import React, { useEffect, useState } from 'react';
import { db, doc, getDoc, collection, query, where, getDocs, deleteDoc } from '../firebase';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Avatar, Divider, Card, CardContent, Grid, Button, Alert } from '@mui/material';
import Blog from '../components/Blog';
import { claimReward } from '../services/rewardService';
import { Owner, Reward } from '../types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const BusinessOwnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchBusinessOwner = async () => {
      if (!id) {
        setError('No business owner ID provided');
        return;
      }

      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOwner(docSnap.data() as Owner);
        } else {
          setError('Business owner not found');
        }
      } catch (error) {
        setError('Error fetching business owner');
        console.error('Error fetching business owner:', error);
      }
    };

    const fetchRewards = async () => {
      if (!id) return;
      try {
        const rewardsQuery = query(collection(db, 'rewards'), where('ownerId', '==', id));
        const querySnapshot = await getDocs(rewardsQuery);
        const rewardsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reward[];
        setRewards(rewardsData);
      } catch (error) {
        setError('Error fetching rewards');
        console.error('Error fetching rewards:', error);
      }
    };

    fetchBusinessOwner();
    fetchRewards();
  }, [id]);

  const handleClaimReward = async (rewardId: string) => {
    if (!user) {
      setError('You must be logged in to claim a reward');
      return;
    }

    try {
      await claimReward(rewardId, user.uid);
      setSuccess('Reward claimed successfully');
    } catch (error: any) {
      setError(`Error claiming reward: ${error.message}`);
      console.error('Error claiming reward:', error);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!user) {
      setError('You must be logged in to delete a reward');
      return;
    }

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      setSuccess('Reward deleted successfully');
      setRewards(rewards.filter(reward => reward.id !== rewardId));
    } catch (error: any) {
      setError(`Error deleting reward: ${error.message}`);
      console.error('Error deleting reward:', error);
    }
  };

  const handleDeletePost = (index: number) => {
    
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!owner) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {owner.profileImage && (
            <Avatar
              src={owner.profileImage}
              alt="Profile Image"
              sx={{ width: 150, height: 150, mr: 2 }}
              imgProps={{ style: { borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' } }}
            />
          )}
          <Typography variant="h4">{owner.name}</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>{owner.description}</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" gutterBottom>Blog Posts</Typography>
          <Blog posts={owner.blog} ownerId={id!} onDelete={handleDeletePost} showEditButtons={false} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" gutterBottom>Rewards</Typography>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {rewards.map((reward) => (
            <Card key={reward.id} sx={{ marginBottom: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar src={reward.image} alt={reward.title} sx={{ width: 56, height: 56 }} />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5">{reward.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{reward.description}</Typography>
                    <Typography variant="body2" color="text.secondary">Quantity: {reward.quantity}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" color="text.secondary">Points: {reward.points}</Typography>
                    <Button variant="contained" color="primary" onClick={() => handleClaimReward(reward.id)} disabled={reward.quantity <= 0}>Claim</Button>
                    {user?.uid === reward.ownerId && (
                      <Button variant="contained" color="secondary" onClick={() => handleDeleteReward(reward.id)}>Delete</Button>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          {rewards.length === 0 && (
            <Typography variant="body1" color="textSecondary">No rewards found.</Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BusinessOwnerDetails;
