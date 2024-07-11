import React, { useEffect, useState, useRef } from 'react';
import { db, doc, getDoc, setDoc, updateDoc } from '../firebase';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, TextField, Button, Paper, Alert, Collapse, CircularProgress, List, ListItem, ListItemText, IconButton, Grid, Box } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useDropzone, Accept } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.snow.css';

import Blog from '../components/Blog';
import Rewards from '../components/Rewards';
import CreateReward from '../components/Rewards/CreateReward';
import AssignPoints from '../components/points/AssignPoints';
import ConfigurePoints from '../components/points/ConfigurePoints';
import PointsHistory from '../components/points/PointsHistory';
import CreateTokenClient from '../components/CreateTokenClient'; 
import { uploadFileToPinata } from '../utils/pinata';
import { Reward } from '../types';
import { getClaimsByOwner, cancelRewardClaim } from '../services/rewardService';
import ClaimsList from '../components/ClaimsList';

const BusinessOwnerDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [blogPosts, setBlogPosts] = useState<{ title: string; content: string; image: string; }[]>([]);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogImage, setNewBlogImage] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [newRewardImage, setNewRewardImage] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [openBlog, setOpenBlog] = useState(false);
  const [openRewards, setOpenRewards] = useState(false);
  const [openCreateReward, setOpenCreateReward] = useState(false);
  const [openAssignPoints, setOpenAssignPoints] = useState(false);
  const [openConfigurePoints, setOpenConfigurePoints] = useState(false);
  const [openPointsHistory, setOpenPointsHistory] = useState(false); 
  const [openCreateToken, setOpenCreateToken] = useState(false); 
  const [loadingClaim, setLoadingClaim] = useState<string | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [rewardDetails, setRewardDetails] = useState<{ [key: string]: any }>({});

  const quillRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setDescription(data.description || '');
            setProfileImage(data.profileImage || '');
            setBlogPosts(data.blog || []);
            setRewards(data.rewards || []);
          }
        } catch (error) {
          setError('Error fetching profile data');
          console.error('Error fetching profile data:', error);
        }
      }
    };

    const fetchClaims = async () => {
      if (user) {
        try {
          const claimsData = await getClaimsByOwner(user.uid);
          setClaims(claimsData);
        } catch (error) {
          setError('Error fetching claims');
          console.error('Error fetching claims:', error);
        }
      }
    };

    fetchProfile();
    fetchClaims();
  }, [user]);

  useEffect(() => {
    const fetchRewardDetails = async () => {
      const rewardData: { [key: string]: any } = {};

      for (const claim of claims) {
        if (!rewardData[claim.rewardId]) {
          const rewardDoc = await getDoc(doc(db, 'rewards', claim.rewardId));
          if (rewardDoc.exists()) {
            rewardData[claim.rewardId] = rewardDoc.data();
          }
        }
      }

      setRewardDetails(rewardData);
    };

    if (claims.length > 0) {
      fetchRewardDetails();
    }
  }, [claims]);

  const handleUpload = async (file: File, callback: (url: string) => void) => {
    if (!file) return;

    try {
      setLoadingClaim('upload');
      const url = await uploadFileToPinata(file);
      callback(url);
      setLoadingClaim(null);
      setUploadError('');
    } catch (error) {
      setUploadError('Error uploading image');
      console.error('Error uploading image:', error);
      setLoadingClaim(null);
    }
  };

  const handleProfileImageUpload = (file: File) => {
    handleUpload(file, setProfileImage);
  };

  const handleRewardImageUpload = (file: File) => {
    handleUpload(file, setNewRewardImage);
  };

  const handleBlogImageUpload = (file: File) => {
    handleUpload(file, setNewBlogImage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating profile...');
      await setDoc(doc(db, 'users', user!.uid), {
        name,
        description,
        profileImage,
        blog: blogPosts,
        rewards
      }, { merge: true });
      setSuccess('Profile updated successfully');
      setOpen(false);
      console.log('Profile updated successfully');
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleNewBlogPost = async () => {
    const newPost = { title: newBlogTitle, content: newBlogContent, image: newBlogImage };
    const updatedBlogPosts = [...blogPosts, newPost];
    setBlogPosts(updatedBlogPosts);
    setNewBlogTitle('');
    setNewBlogContent('');
    setNewBlogImage('');
    console.log('New blog post added:', newPost);

    
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        blog: updatedBlogPosts
      }, { merge: true });
      console.log('Blog post saved to database');
    } catch (error) {
      console.error('Error saving blog post to database:', error);
    }
  };

  const handleDeleteBlogPost = async (index: number) => {
    const updatedBlogPosts = blogPosts.filter((_, i) => i !== index);
    setBlogPosts(updatedBlogPosts);
    console.log('Blog post deleted:', index);

    
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        blog: updatedBlogPosts
      }, { merge: true });
      console.log('Blog post deleted from database');
    } catch (error) {
      console.error('Error deleting blog post from database:', error);
    }
  };

  const handleNewReward = async () => {
    const newReward: Reward = { id: Date.now().toString(), title: newRewardTitle, description: newRewardDescription, points: parseInt(newRewardPoints, 10), image: newRewardImage, ownerId: user!.uid, quantity: 10 }; 
    const updatedRewards = [...rewards, newReward];
    setRewards(updatedRewards);
    setNewRewardTitle('');
    setNewRewardPoints('');
    setNewRewardDescription('');
    setNewRewardImage('');
    console.log('New reward added:', newReward);

    
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        rewards: updatedRewards
      }, { merge: true });
      console.log('Reward saved to database');
    } catch (error) {
      console.error('Error saving reward to database:', error);
    }
  };

  const handleDeleteReward = async (index: number) => {
    const updatedRewards = rewards.filter((_, i) => i !== index);
    setRewards(updatedRewards);
    console.log('Reward deleted:', index);

    
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        rewards: updatedRewards
      }, { merge: true });
      console.log('Reward deleted from database');
    } catch (error) {
      console.error('Error deleting reward from database:', error);
    }
  };

  const handleConfirmClaim = async (claimId: string) => {
    try {
      setLoadingClaim(claimId);
      await updateDoc(doc(db, 'claims', claimId), {
        status: 'approved',
        approvedBy: user!.uid,
      });
      setClaims(prevClaims => prevClaims.map(claim => claim.id === claimId ? { ...claim, status: 'approved' } : claim));
      setSuccess('Claim approved successfully.');
      setLoadingClaim(null);
    } catch (error) {
      setError('Error approving claim');
      console.error('Error approving claim:', error);
      setLoadingClaim(null);
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    try {
      setLoadingClaim(claimId);
      await cancelRewardClaim(claimId);
      setClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimId));
      setSuccess('Claim cancelled successfully');
      setLoadingClaim(null);
    } catch (error) {
      setError('Error cancelling claim');
      console.error('Error cancelling claim:', error);
      setLoadingClaim(null);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLocalImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' as unknown as Accept });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>
      )}
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {profileImage && <img src={profileImage} alt="Profile" style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 10 }} />}
          <Typography variant="h6">
            {name}
          </Typography>
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpen(!open)} 
          sx={{ marginTop: 2 }}
          endIcon={open ? <ExpandLess /> : <ExpandMore />}
        >
          {open ? 'Hide' : 'Edit Profile'}
        </Button>
        <Collapse in={open}>
          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center', marginTop: '10px' }}>
              <input {...getInputProps()} />
              {localImage ? (
                <p>{localImage.name}</p>
              ) : (
                <p>Drag 'n' drop a profile image here, or click to select one</p>
              )}
            </div>
            {uploadError && (
              <Alert severity="error" sx={{ marginTop: 2 }}>{uploadError}</Alert>
            )}
            {localImage && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginTop: 2 }}
                onClick={() => handleProfileImageUpload(localImage)}
              >
                {loadingClaim === 'upload' ? <CircularProgress size={24} /> : 'Upload Image'}
              </Button>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
              Update Profile
            </Button>
          </form>
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Blog
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenBlog(!openBlog)} 
          sx={{ marginTop: 2 }}
          endIcon={openBlog ? <ExpandLess /> : <ExpandMore />}
        >
          {openBlog ? 'Hide' : 'Show Blog'}
        </Button>
        <Collapse in={openBlog}>
          <Blog posts={blogPosts} ownerId={user!.uid} onDelete={handleDeleteBlogPost} showEditButtons />
          <TextField
            label="New Blog Title"
            value={newBlogTitle}
            onChange={(e) => setNewBlogTitle(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <ReactQuill 
            value={newBlogContent}
            onChange={setNewBlogContent}
            ref={quillRef}
            style={{ height: '200px', marginBottom: '20px' }}
          />
          <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center', marginTop: '10px' }}>
            <input {...getInputProps()} />
            {localImage ? (
              <p>{localImage.name}</p>
            ) : (
              <p>Drag 'n' drop a blog image here, or click to select one</p>
            )}
          </div>
          {uploadError && (
            <Alert severity="error" sx={{ marginTop: 2 }}>{uploadError}</Alert>
          )}
          {localImage && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2 }}
              onClick={() => handleBlogImageUpload(localImage)}
            >
              {loadingClaim === 'upload' ? <CircularProgress size={24} /> : 'Upload Image'}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewBlogPost}
            sx={{ marginTop: 2 }}
          >
            Add Blog Post
          </Button>
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create Points spl20
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenCreateToken(!openCreateToken)} 
          sx={{ marginTop: 2 }}
          endIcon={openCreateToken ? <ExpandLess /> : <ExpandMore />}
        >
          {openCreateToken ? 'Hide' : 'Show Create SPL Token'}
        </Button>
        <Collapse in={openCreateToken}>
          <CreateTokenClient />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Assign Points
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenAssignPoints(!openAssignPoints)} 
          sx={{ marginTop: 2 }}
          endIcon={openAssignPoints ? <ExpandLess /> : <ExpandMore />}
        >
          {openAssignPoints ? 'Hide' : 'Show Assign Points'}
        </Button>
        <Collapse in={openAssignPoints}>
          <AssignPoints />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Configure Points
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenConfigurePoints(!openConfigurePoints)} 
          sx={{ marginTop: 2 }}
          endIcon={openConfigurePoints ? <ExpandLess /> : <ExpandMore />}
        >
          {openConfigurePoints ? 'Hide' : 'Show Configure Points'}
        </Button>
        <Collapse in={openConfigurePoints}>
          <ConfigurePoints />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Points History
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenPointsHistory(!openPointsHistory)} 
          sx={{ marginTop: 2 }}
          endIcon={openPointsHistory ? <ExpandLess /> : <ExpandMore />}
        >
          {openPointsHistory ? 'Hide' : 'Show Points History'}
        </Button>
        <Collapse in={openPointsHistory}>
          <PointsHistory />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Redeemable Rewards
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenRewards(!openRewards)} 
          sx={{ marginTop: 2 }}
          endIcon={openRewards ? <ExpandLess /> : <ExpandMore />}
        >
          {openRewards ? 'Hide' : 'Show Rewards'}
        </Button>
        <Collapse in={openRewards}>
          <Rewards rewards={rewards} ownerId={user!.uid} onDelete={handleDeleteReward} showEditButtons />
          <CreateReward />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Reward Claims
        </Typography>
        <List>
          {claims.map((claim) => (
            <ListItem key={claim.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography variant="body2">
                  <strong>Reward ID:</strong> {claim.rewardId}
                </Typography>
                <Typography variant="body2">
                  <strong>User Email:</strong> {claim.userEmail || 'Not provided'}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {claim.status}
                </Typography>
                {rewardDetails[claim.rewardId] && (
                  <>
                    <Typography variant="body2">
                      <strong>Reward Title:</strong> {rewardDetails[claim.rewardId].title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reward Description:</strong> {rewardDetails[claim.rewardId].description}
                    </Typography>
                  </>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ml: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCancelClaim(claim.id)}
                  disabled={claim.status !== 'pending' || loadingClaim === claim.id}
                  sx={{ marginBottom: 1 }}
                >
                  {loadingClaim === claim.id ? <CircularProgress size={24} /> : 'Cancel Claim'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleConfirmClaim(claim.id)}
                  disabled={claim.status !== 'pending' || loadingClaim === claim.id}
                >
                  {loadingClaim === claim.id ? <CircularProgress size={24} /> : 'Confirm Claim'}
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
        {claims.length === 0 && (
          <Typography variant="body1" color="textSecondary">
            No claims found.
          </Typography>
        )}
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          All Claimed Rewards
        </Typography>
        <ClaimsList />
      </Paper>
    </Container>
  );
};

export default BusinessOwnerDashboard;
