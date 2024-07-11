import React, { useEffect, useState } from 'react';
import { db, collection, query, where, getDocs, doc, getDoc, setDoc, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Container, Typography, List, ListItem, ListItemText, Button, Paper, TextField, Collapse, Alert, CircularProgress, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { uploadFileToPinata } from '../utils/pinata';
import { confirmUserRewardClaim, getClaimData, cancelRewardClaim } from '../services/rewardService';
import { PublicKey, Connection } from '@solana/web3.js';
import ClaimsList from '../components/ClaimsList';

interface BusinessOwner {
  id: string;
  email: string;
  publicKey?: string;
}

interface Token {
  mintAccount: string;
  tokenAta: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  sellerFee: number;
  creators: { address: string; verified: boolean; share: number }[];
  metadataUri: string;
  transactionId: string;
  amount?: number;  
}

const UserDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [businessOwners, setBusinessOwners] = useState<BusinessOwner[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [localImage, setLocalImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [claimedRewardsOpen, setClaimedRewardsOpen] = useState<boolean>(true);
  const [allClaimsOpen, setAllClaimsOpen] = useState<boolean>(true);
  const [burnLoading, setBurnLoading] = useState<{ [key: string]: boolean }>({});
  const [enterpriseConnectOpen, setEnterpriseConnectOpen] = useState<boolean>(false);
  const connection = new Connection('https://api.devnet.solana.com');

  useEffect(() => {
    const fetchBusinessOwners = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'business-owner'));
        const querySnapshot = await getDocs(q);
        const businessOwnersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BusinessOwner[];
        setBusinessOwners(businessOwnersData);
      } catch (error) {
        setError('Error fetching business owners');
        console.error('Error fetching business owners: ', error);
      }
    };

    const fetchFollowing = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFollowing(data.following || []);
            setName(data.name || '');
            setProfileImage(data.profileImage || '');
          }
        } catch (error) {
          setError('Error fetching following list');
          console.error('Error fetching following list: ', error);
        }
      }
    };

    const fetchClaims = async () => {
      if (user) {
        try {
          const claimsQuery = query(collection(db, 'claims'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(claimsQuery);
          const claimsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setClaims(claimsData);
        } catch (error) {
          setError('Error fetching claims');
          console.error('Error fetching claims: ', error);
        }
      }
    };

    fetchBusinessOwners();
    fetchFollowing();
    fetchClaims();
  }, [user]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    try {
      setLoading(true);
      const url = await uploadFileToPinata(file);
      setProfileImage(url);
      setLocalImage(null);
      setUploadError('');
      setLoading(false);
    } catch (error) {
      setUploadError('Error uploading image');
      console.error('Error uploading image:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating profile...');
      await setDoc(doc(db, 'users', user!.uid), {
        name,
        profileImage
      }, { merge: true });
      setSuccess('Profile updated successfully');
      setOpen(false);
      console.log('Profile updated successfully');
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleFollowToggle = async (businessOwnerId: string) => {
    if (user) {
      try {
        const newFollowing = following.includes(businessOwnerId)
          ? following.filter(id => id !== businessOwnerId)
          : [...following, businessOwnerId];

        await setDoc(doc(db, 'users', user.uid), { following: newFollowing }, { merge: true });
        setFollowing(newFollowing);
      } catch (error) {
        setError('Error following/unfollowing business owner');
        console.error('Error following/unfollowing business owner: ', error);
      }
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    try {
      setLoading(true);
      await cancelRewardClaim(claimId);
      setClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimId));
      setSuccess('Claim cancelled successfully');
      setLoading(false);
    } catch (error) {
      setError('Error cancelling claim');
      console.error('Error cancelling claim:', error);
      setLoading(false);
    }
  };

  const handleConfirmClaim = async (claimId: string) => {
    setBurnLoading(prev => ({ ...prev, [claimId]: true }));
    try {
      const claimData = await getClaimData(claimId);
      const rewardDoc = await getDoc(doc(db, 'rewards', claimData.rewardId));
      if (!rewardDoc.exists()) {
        throw new Error('Reward does not exist');
      }
      const rewardData = rewardDoc.data();
      const ownerId = rewardData!.ownerId;
      
      
      const tokensQuery = query(collection(db, 'tokens'), where('ownerId', '==', ownerId));
      const tokensSnapshot = await getDocs(tokensQuery);
      if (tokensSnapshot.empty) {
        throw new Error('No tokens found for this business owner');
      }
  
      
      const tokenData = tokensSnapshot.docs[0].data();
  
      
      if (!tokenData.mintAccount || !tokenData.tokenAta) {
        throw new Error('Invalid token data');
      }
  
      await confirmUserRewardClaim(claimId, user, tokenData);
  
      setClaims(prevClaims => prevClaims.map(claim => claim.id === claimId ? { ...claim, status: 'completed' } : claim));
      setSuccess('Claim confirmed and tokens burned successfully');
    } catch (error: unknown) {
      setError(`Error confirming claim: ${(error as Error).message}`);
      console.error('Error confirming claim:', error);
    } finally {
      setBurnLoading(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLocalImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.png', '.jpg'] } });

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
                onClick={() => handleUpload(localImage)}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Image'}
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
          EnterpriseConnect
          <IconButton
            onClick={() => setEnterpriseConnectOpen(!enterpriseConnectOpen)}
            size="small"
            sx={{ marginLeft: 1 }}
          >
            {enterpriseConnectOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Typography>
        <Collapse in={enterpriseConnectOpen}>
          <List>
            {businessOwners.map((owner) => (
              <ListItem key={owner.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <ListItemText 
                  primary={`Email: ${owner.email}`} 
                  secondary={`Solana Public Key: ${owner.publicKey || 'Not provided'}`} 
                />
                <Button
                  variant="contained"
                  color={following.includes(owner.id) ? "secondary" : "primary"}
                  onClick={() => handleFollowToggle(owner.id)}
                >
                  {following.includes(owner.id) ? "Unfollow" : "Follow"}
                </Button>
              </ListItem>
            ))}
          </List>
          {businessOwners.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              No business owners found.
            </Typography>
          )}
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Claimed Rewards
          <IconButton
            onClick={() => setClaimedRewardsOpen(!claimedRewardsOpen)}
            size="small"
            sx={{ marginLeft: 1 }}
          >
            {claimedRewardsOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Typography>
        <Collapse in={claimedRewardsOpen}>
          <List>
            {claims.map((claim) => (
              <ListItem key={claim.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <ListItemText 
                  primary={`Reward ID: ${claim.rewardId}`} 
                  secondary={`Status: ${claim.status}`} 
                />
                {claim.status === 'pending' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleCancelClaim(claim.id)}
                    disabled={loading}
                    sx={{ marginRight: 1 }}
                  >
                    Cancel Claim
                  </Button>
                )}
                {claim.status === 'approved' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmClaim(claim.id)}
                    disabled={burnLoading[claim.id]}
                  >
                    {burnLoading[claim.id] ? <CircularProgress size={24} color="inherit" /> : 'Burn Tokens'}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
          {claims.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              No claimed rewards found.
            </Typography>
          )}
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          All Claimed Rewards
          <IconButton
            onClick={() => setAllClaimsOpen(!allClaimsOpen)}
            size="small"
            sx={{ marginLeft: 1 }}
          >
            {allClaimsOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Typography>
        <Collapse in={allClaimsOpen}>
          <ClaimsList />
        </Collapse>
      </Paper>
    </Container>
  );
};

export default UserDashboard;
