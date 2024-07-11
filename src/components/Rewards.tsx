import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Reward } from '../types'; // Importa l'interfaccia comune

interface RewardsProps {
  rewards: Reward[];
  ownerId: string;
  onDelete: (index: number) => void;
  showEditButtons: boolean;
}

const Rewards: React.FC<RewardsProps> = ({ rewards, ownerId, onDelete, showEditButtons }) => {
  return (
    <Box>
      <Typography variant="h6">Rewards</Typography>
      {rewards.map((reward, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle1">{reward.title}</Typography>
          <Typography variant="body2">{reward.description}</Typography>
          {reward.image && <img src={reward.image} alt={reward.title} />}
          {reward.points && <Typography variant="body2">Points: {reward.points}</Typography>}
          {showEditButtons && (
            <Button variant="contained" color="secondary" onClick={() => onDelete(index)}>
              Delete
            </Button>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Rewards;
