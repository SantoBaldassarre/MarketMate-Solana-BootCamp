import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { uploadFileToPinata } from '../../utils/pinata';
import { createReward } from '../../services/rewardService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

const CreateReward: React.FC = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = async () => {
    if (!image) return;

    try {
      setLoading(true);
      const imageUrl = await uploadFileToPinata(image);
      setLoading(false);
      return imageUrl;
    } catch (error) {
      setUploadError('Error uploading image');
      console.error('Error uploading image:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageUrl = await handleImageUpload();
      if (!imageUrl) {
        setError('Image upload failed');
        return;
      }
      if (user) {
        await createReward(title, description, parseInt(points, 10), imageUrl, user.uid, parseInt(quantity, 10)); 
        setSuccess('Reward created successfully');
        setTitle('');
        setDescription('');
        setPoints('');
        setQuantity('');
        setImage(null);
      }
    } catch (error) {
      setError('Error creating reward');
      console.error('Error creating reward:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4 }}>
      <Typography variant="h6" gutterBottom>Create New Reward</Typography>
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
        />
        <TextField
          label="Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          type="number"
          required
        />
        <TextField
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          type="number"
          required
        />
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            component="label"
            color="secondary"
          >
            Upload Image
            <input
              type="file"
              hidden
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            />
          </Button>
          {image && <Typography variant="body2" sx={{ marginTop: 1 }}>{image.name}</Typography>}
        </Box>
        {uploadError && <Alert severity="error" sx={{ marginTop: 2 }}>{uploadError}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Reward'}
        </Button>
      </form>
    </Paper>
  );
};

export default CreateReward;
