import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useDropzone, FileRejection } from 'react-dropzone';
import axios from 'axios';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

const UpdateReward: React.FC = () => {
  const { id, index } = useParams<{ id: string; index: string }>();
  const navigate = useNavigate();
  const [reward, setReward] = useState<{ title: string; points: string; image: string }>({ title: '', points: '', image: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    const fetchReward = async () => {
      try {
        if (id && index) {
          const docRef = doc(db, 'users', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rewards && data.rewards[Number(index)]) {
              setReward(data.rewards[Number(index)]);
            } else {
              setError('Reward not found');
            }
          } else {
            setError('Reward not found');
          }
        } else {
          setError('Invalid reward ID or index');
        }
      } catch (error) {
        setError('Error fetching reward');
        console.error('Error fetching reward:', error);
      }
    };

    fetchReward();
  }, [id, index]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: 'Reward Image',
      keyvalues: {
        user: id,
      },
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    try {
      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_API_SECRET!,
        },
      });
      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      setReward({ ...reward, image: url });
      setLocalImage(null);
      setUploadError('');
    } catch (error) {
      setUploadError('Error uploading image');
      console.error('Error uploading image:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id && index) {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          data.rewards[Number(index)] = reward;
          await setDoc(docRef, data, { merge: true });
          setSuccess('Reward updated successfully');
          setTimeout(() => navigate(`/business-owner/${id}`), 2000);
        } else {
          setError('Error updating reward');
        }
      } else {
        setError('Invalid reward ID or index');
      }
    } catch (error) {
      setError('Error updating reward');
      console.error('Error updating reward:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (id && index) {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          data.rewards.splice(Number(index), 1); 
          await setDoc(docRef, data, { merge: true });
          setSuccess('Reward deleted successfully');
          setTimeout(() => navigate(`/business-owner/${id}`), 2000);
        } else {
          setError('Error deleting reward');
        }
      } else {
        setError('Invalid reward ID or index');
      }
    } catch (error) {
      setError('Error deleting reward');
      console.error('Error deleting reward:', error);
    }
  };

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setLocalImage(acceptedFiles[0]);
    }
    if (fileRejections.length > 0) {
      setUploadError('Invalid file type');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Update Reward
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            label="Title"
            value={reward.title}
            onChange={(e) => setReward({ ...reward, title: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            label="Points"
            value={reward.points}
            onChange={(e) => setReward({ ...reward, points: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center', marginTop: '10px' }}>
            <input {...getInputProps()} />
            {localImage ? (
              <p>{localImage.name}</p>
            ) : (
              <p>Drag 'n' drop a new image here, or click to select one</p>
            )}
          </div>
          {uploadError && <Alert severity="error" sx={{ marginTop: 2 }}>{uploadError}</Alert>}
          {localImage && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2 }}
              onClick={() => handleUpload(localImage)}
            >
              Upload Image
            </Button>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Update Reward
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleDelete}
          >
            Delete Reward
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default UpdateReward;
