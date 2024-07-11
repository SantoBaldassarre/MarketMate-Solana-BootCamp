import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, doc, getDoc } from '../firebase';
import { List, ListItem, ListItemText, Typography, Paper, Collapse, IconButton, Avatar, Grid } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const ClaimsList: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [rewardDetails, setRewardDetails] = useState<{ [key: string]: any }>({});
  const [ownerDetails, setOwnerDetails] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const claimsQuery = collection(db, 'claims');
        const querySnapshot = await getDocs(claimsQuery);
        const claimsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClaims(claimsData);
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    };

    fetchClaims();
  }, []);

  useEffect(() => {
    const fetchRewardDetails = async () => {
      const rewardData: { [key: string]: any } = {};
      const ownerData: { [key: string]: any } = {};

      for (const claim of claims) {
        if (!rewardData[claim.rewardId]) {
          const rewardDoc = await getDoc(doc(db, 'rewards', claim.rewardId));
          if (rewardDoc.exists()) {
            rewardData[claim.rewardId] = rewardDoc.data();
            const ownerDoc = await getDoc(doc(db, 'users', rewardDoc.data()!.ownerId));
            if (ownerDoc.exists()) {
              ownerData[rewardDoc.data()!.ownerId] = ownerDoc.data();
            }
          }
        }
      }

      setRewardDetails(rewardData);
      setOwnerDetails(ownerData);
    };

    if (claims.length > 0) {
      fetchRewardDetails();
    }
  }, [claims]);

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <List>
      {claims.map((claim) => (
        <React.Fragment key={claim.id}>
          <ListItem sx={{ borderBottom: '1px solid #e0e0e0', alignItems: 'flex-start' }}>
            <Avatar 
              src={rewardDetails[claim.rewardId]?.image || ''} 
              variant="rounded" 
              sx={{ width: 80, height: 80, marginRight: 2 }}
            />
            <ListItemText 
              primary={rewardDetails[claim.rewardId]?.title || 'Loading...'} 
              secondary={`Status: ${claim.status}`} 
            />
            <IconButton onClick={() => handleToggleExpand(claim.id)} size="small">
              {expanded[claim.id] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItem>
          <Collapse in={expanded[claim.id]} timeout="auto" unmountOnExit>
            <Paper elevation={1} sx={{ padding: 2, marginTop: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Business Owner:</strong> {ownerDetails[rewardDetails[claim.rewardId]?.ownerId]?.email || 'Loading...'}
              </Typography>
              <Typography variant="body2">
                <strong>Reward Description:</strong> {rewardDetails[claim.rewardId]?.description || 'Loading...'}
              </Typography>
              <Typography variant="body2">
                <strong>Tokens Spent:</strong> {rewardDetails[claim.rewardId]?.points || 'Loading...'}
              </Typography>
              <Typography variant="body2">
                <strong>User Email:</strong> {claim.userEmail}
              </Typography>
              <Typography variant="body2">
                <strong>Approved By:</strong> {claim.approvedBy}
              </Typography>
              <Typography variant="body2">
                <strong>Created At:</strong> {new Date(claim.createdAt.seconds * 1000).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {claim.status}
              </Typography>
            </Paper>
          </Collapse>
        </React.Fragment>
      ))}
      {claims.length === 0 && (
        <Typography variant="body1" color="textSecondary">
          No claimed rewards found.
        </Typography>
      )}
    </List>
  );
};

export default ClaimsList;
