import React from 'react';
import { List, ListItem, ListItemText, Button } from '@mui/material';

interface ManageClaimsProps {
  claims: any[];
  onConfirm: (claimId: string) => void;
  onCancel: (claimId: string) => void;
  loading: boolean;
}

const ManageClaims: React.FC<ManageClaimsProps> = ({ claims, onConfirm, onCancel, loading }) => {
  return (
    <List>
      {claims.map((claim) => (
        <ListItem key={claim.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <ListItemText 
            primary={`Reward ID: ${claim.rewardId}`} 
            secondary={`User Email: ${claim.userEmail || 'Not provided'}`} 
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onCancel(claim.id)}
            disabled={claim.status !== 'pending' || loading}
            sx={{ marginRight: 2 }}
          >
            Cancel Claim
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onConfirm(claim.id)}
            disabled={claim.status !== 'pending' || loading}
          >
            Confirm Claim
          </Button>
        </ListItem>
      ))}
      {claims.length === 0 && (
        <ListItem>
          <ListItemText primary="No claims found." />
        </ListItem>
      )}
    </List>
  );
};

export default ManageClaims;
