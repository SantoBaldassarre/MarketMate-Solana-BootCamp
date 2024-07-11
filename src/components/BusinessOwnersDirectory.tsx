import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../firebase';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface BusinessOwner {
  id: string;
  profileImage?: string;
  name: string;
  description?: string;
}

const BusinessOwnersDirectory: React.FC = () => {
  const [businessOwners, setBusinessOwners] = useState<BusinessOwner[]>([]);
  const [error, setError] = useState<string>('');

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

    fetchBusinessOwners();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {error && (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      )}
      <Typography variant="h4" gutterBottom>
        MarketConnect
      </Typography>
      <Grid container spacing={4}>
        {businessOwners.map((owner) => (
          <Grid item key={owner.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={owner.profileImage || 'default-image-url.jpg'} 
                alt={owner.name}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {owner.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {owner.description || 'No description available.'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/business-owner/${owner.id}`}
                  sx={{ mt: 2 }}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BusinessOwnersDirectory;
