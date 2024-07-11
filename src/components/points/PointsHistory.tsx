import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const PointsHistory: React.FC = () => {
  const [user] = useAuthState(auth);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPointsHistory = async () => {
      if (!user) return;

      try {
        const pointsQuery = query(collection(db, 'points'), where('assignedBy', '==', user.uid));
        const querySnapshot = await getDocs(pointsQuery);
        const historyData = querySnapshot.docs.map(doc => doc.data());
        setPointsHistory(historyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching points history:', error);
        setError('Error fetching points history.');
        setLoading(false);
      }
    };

    fetchPointsHistory();
  }, [user]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Points History
      </Typography>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <List>
          {pointsHistory.length > 0 ? (
            pointsHistory.map((entry, index) => {
              const sortedPurchaseItems = entry.purchaseItems?.sort((a: any, b: any) => a.itemName.localeCompare(b.itemName)) || [];
              return (
                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <>
                        {entry.airdrop && (
                          <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                            Airdrop
                          </Typography>
                        )}
                        <Typography variant="body2"><strong>Points:</strong> {entry.points}</Typography>
                        <Typography variant="body2"><strong>Tokens:</strong> {entry.tokens}</Typography>
                        <Typography variant="body2"><strong>User ID:</strong> {entry.userId}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {entry.userEmail}</Typography>
                        <Typography variant="body2"><strong>Public Address:</strong> {entry.userPublicAddress}</Typography>
                      </>
                    }
                  />
                  {sortedPurchaseItems.length > 0 && (
                    <Box>
                      {sortedPurchaseItems.map((item: any, i: number) => (
                        <Typography key={i} variant="body2">
                          <strong>Purchase {i + 1}:</strong> {item.itemName} (Quantity: {item.quantity})
                        </Typography>
                      ))}
                    </Box>
                  )}
                  <Typography variant="body2"><strong>Assigned At:</strong> {entry.assignedAt}</Typography>
                </ListItem>
              );
            })
          ) : (
            <Typography variant="body1">No points history found.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default PointsHistory;
