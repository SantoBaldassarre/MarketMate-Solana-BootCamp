import React, { useState } from 'react';
import { claimReward } from '../../services/rewardService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { TextField, Button, Alert, CircularProgress, Paper, Typography } from '@mui/material';

interface ClaimRewardProps {
  ownerId: string;
}

const ClaimReward: React.FC<ClaimRewardProps> = ({ ownerId }) => {
  const [user] = useAuthState(auth);
  const [rewardId, setRewardId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleClaimReward = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await claimReward(rewardId, user.uid);
      setSuccess('Reward claimed successfully');
      setRewardId('');
    } catch (error: any) {
      setError(`Error claiming reward: ${error.message}`);
      console.error('Error claiming reward:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
      <Typography variant="h6" gutterBottom>
        Claim Reward
      </Typography>
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>
      )}
      <TextField
        label="Reward ID"
        value={rewardId}
        onChange={(e) => setRewardId(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        required
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleClaimReward}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Claim Reward'}
      </Button>
    </Paper>
  );
};

export default ClaimReward;
