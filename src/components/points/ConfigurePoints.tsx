import React, { useState, useEffect } from 'react';
import { auth, db, setDoc, doc } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';

const ConfigurePoints: React.FC = () => {
  const [user] = useAuthState(auth);
  const [pointsValue, setPointsValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
    }
  }, [user]);

  const handleConfigurePoints = async () => {
    if (!pointsValue) {
      setError('Please provide a value for points');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await setDoc(doc(db, 'pointsConfiguration', user.uid), {
        pointsValue: Number(pointsValue),
        configuredBy: user.uid,
        configuredAt: new Date().toISOString(),
      });

      setSuccess('Points value configured successfully');
    } catch (error) {
      console.error('Error configuring points value:', error);
      setError('Error configuring points value. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Typography variant="h6" gutterBottom>
        Configure Points
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        label="Points Value"
        value={pointsValue}
        onChange={(e) => setPointsValue(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        type="number"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleConfigurePoints}
        sx={{ marginTop: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Configure Points'}
      </Button>
    </Paper>
  );
};

export default ConfigurePoints;
