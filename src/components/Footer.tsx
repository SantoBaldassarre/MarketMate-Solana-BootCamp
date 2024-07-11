import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px',
        background: 'linear-gradient(45deg, #4da398 70%, #90c0c7 30%)',
        color: 'white',
        position: 'relative', 
        bottom: 0,
        width: '100%',
        mt: 'auto' 
      }}
    >
      <Typography variant="body1">
        © 2024 MarketMate. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
