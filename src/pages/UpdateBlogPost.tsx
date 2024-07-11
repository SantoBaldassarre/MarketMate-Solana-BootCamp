import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useDropzone, FileRejection } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

const UpdateBlogPost: React.FC = () => {
  const { id, index } = useParams<{ id: string; index: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<{ title: string; content: string; image: string }>({ title: '', content: '', image: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id && index) {
          const docRef = doc(db, 'users', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.blog && data.blog[Number(index)]) {
              setPost(data.blog[Number(index)]);
            } else {
              setError('Blog post not found');
            }
          } else {
            setError('Blog post not found');
          }
        } else {
          setError('Invalid blog post ID or index');
        }
      } catch (error) {
        setError('Error fetching blog post');
        console.error('Error fetching blog post:', error);
      }
    };

    fetchPost();
  }, [id, index]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: 'Blog Image',
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
      setPost({ ...post, image: url });
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
          data.blog[Number(index)] = post;
          await setDoc(docRef, data, { merge: true });
          setSuccess('Blog post updated successfully');
          setTimeout(() => navigate(`/business-owner/${id}`), 2000);
        } else {
          setError('Error updating blog post');
        }
      } else {
        setError('Invalid blog post ID or index');
      }
    } catch (error) {
      setError('Error updating blog post');
      console.error('Error updating blog post:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (id && index) {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          data.blog.splice(Number(index), 1); 
          await setDoc(docRef, data, { merge: true });
          setSuccess('Blog post deleted successfully');
          setTimeout(() => navigate(`/business-owner/${id}`), 2000);
        } else {
          setError('Error deleting blog post');
        }
      } else {
        setError('Invalid blog post ID or index');
      }
    } catch (error) {
      setError('Error deleting blog post');
      console.error('Error deleting blog post:', error);
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
          Update Blog Post
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            label="Title"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <ReactQuill
            value={post.content}
            onChange={(content) => setPost({ ...post, content })}
            style={{ height: '200px', marginBottom: '20px' }}
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
            Update Post
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleDelete}
          >
            Delete Post
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default UpdateBlogPost;
