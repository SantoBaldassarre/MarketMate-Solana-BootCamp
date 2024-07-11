import React, { useState } from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent, Collapse, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import backgroundImage from '../assets/background.jpg'; 

const Home = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpandClick = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  return (
    <div>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '85vh',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#d3d3d3', 
          padding: 4,
          marginBottom: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          MarketMate
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          The Best Way to Care for Your Customers
        </Typography>
        <Box sx={{ marginTop: 4 }}>
          <Button
            variant="contained"
            sx={{
              marginRight: 2,
              fontWeight: 'bold',
              borderRadius: 50,
              backgroundColor: '#b2dfdb',
              color: '#004d40',
              '&:hover': {
                backgroundColor: '#80cbc4'
              }
            }}
            component={Link}
            to="/login"
          >
            Login
          </Button>
          <Button
            variant="contained"
            sx={{
              fontWeight: 'bold',
              borderRadius: 50,
              backgroundColor: '#e0f7fa',
              color: '#006064',
              '&:hover': {
                backgroundColor: '#b2ebf2'
              }
            }}
            component={Link}
            to="/register"
          >
            Register
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Secure Transactions
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    MarketMate leverages the Solana blockchain to ensure all your transactions are secure and transparent.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Easy Token Management
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Create and manage tokens effortlessly with our intuitive interface, designed for users of all skill levels.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    User-Friendly Wallet
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Our internal wallet is easy to manage, allowing you to view and use tokens created within MarketMate, minimizing the risk of scams.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* About Us Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            About Us
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            MarketMate is dedicated to providing top-notch market management solutions. Our platform offers a comprehensive suite of tools designed to streamline your market operations, improve efficiency, and enhance your overall experience.
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            Our mission is to empower businesses with the tools they need to succeed in today's competitive market. Whether you're a small business owner or a large enterprise, MarketMate has the solutions to meet your needs.
          </Typography>
        </Box>

        {/* How It Works Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            How It Works
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            MarketMate leverages the Solana blockchain to ensure secure and transparent transactions. Our user-friendly interface allows you to create and manage tokens effortlessly, regardless of your technical expertise.
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            With MarketMate, you can trust that only tokens created within our platform are visible and usable, minimizing the risk of scams. Our integration with Google Firebase simplifies the authentication and registration process, making it easy for anyone to get started.
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            Users can export their private keys for created wallets, ensuring full ownership and control over their assets.
          </Typography>
        </Box>

        {/* Roadmap Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            Roadmap
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 1: Platform Launch
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Initial launch of the MarketMate platform with core features for market management.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 2: Mobile App Development
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Develop and launch a mobile application for MarketMate, providing on-the-go access to platform features.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 3: Marketing and Social Media Integration
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Expand MarketMate's reach through marketing campaigns and integration with social media platforms.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 4: MarketMate Token Launch
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Launch the MarketMate Token as a utility token to pay for services, offering discounts and rewards with MatePoints, which are non-tradable.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 5: Social Platform Integration
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Integrate MarketMate with various social platforms to enhance community engagement and user interaction.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', backgroundColor: '#e0f7fa', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Phase 6: Integration with Electronic Cash Registers
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#404040' }}>
                    Integrate MarketMate into electronic cash registers, streamlining transaction processes for businesses.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            Frequently Asked Questions
          </Typography>

          <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 3, backgroundColor: '#e0f7fa' }}>
            <Typography variant="h6" onClick={() => handleExpandClick('panel1')} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#404040' }}>
              What is MarketMate?
              <IconButton>
                {expanded === 'panel1' ? <ExpandLess sx={{ color: '#404040' }} /> : <ExpandMore sx={{ color: '#404040' }} />}
              </IconButton>
            </Typography>
            <Collapse in={expanded === 'panel1'}>
              <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
                MarketMate is a comprehensive market management platform that leverages blockchain technology to ensure secure and efficient transactions.
              </Typography>
            </Collapse>
          </Paper>

          <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 3, backgroundColor: '#e0f7fa' }}>
            <Typography variant="h6" onClick={() => handleExpandClick('panel2')} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#404040' }}>
              How do I get started?
              <IconButton>
                {expanded === 'panel2' ? <ExpandLess sx={{ color: '#404040' }} /> : <ExpandMore sx={{ color: '#404040' }} />}
              </IconButton>
            </Typography>
            <Collapse in={expanded === 'panel2'}>
              <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
                You can get started by signing up on our platform. We use Google Firebase for easy authentication and registration.
              </Typography>
            </Collapse>
          </Paper>

          <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 3, backgroundColor: '#e0f7fa' }}>
            <Typography variant="h6" onClick={() => handleExpandClick('panel3')} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#404040' }}>
              Is MarketMate secure?
              <IconButton>
                {expanded === 'panel3' ? <ExpandLess sx={{ color: '#404040' }} /> : <ExpandMore sx={{ color: '#404040' }} />}
              </IconButton>
            </Typography>
            <Collapse in={expanded === 'panel3'}>
              <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
                Yes, MarketMate uses the Solana blockchain to ensure that all transactions are secure and transparent. Additionally, only tokens created within the platform are visible and usable, minimizing the risk of scams.
              </Typography>
            </Collapse>
          </Paper>

          <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 3, backgroundColor: '#e0f7fa' }}>
            <Typography variant="h6" onClick={() => handleExpandClick('panel4')} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#404040' }}>
              Can I export my private keys?
              <IconButton>
                {expanded === 'panel4' ? <ExpandLess sx={{ color: '#404040' }} /> : <ExpandMore sx={{ color: '#404040' }} />}
              </IconButton>
            </Typography>
            <Collapse in={expanded === 'panel4'}>
              <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
                Yes, users can export their private keys for the wallets created, ensuring full ownership and control over their assets.
              </Typography>
            </Collapse>
          </Paper>

          <Paper sx={{ padding: 2, marginBottom: 2, borderRadius: 3, backgroundColor: '#e0f7fa' }}>
            <Typography variant="h6" onClick={() => handleExpandClick('panel5')} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#404040' }}>
              How much does MarketMate cost?
              <IconButton>
                {expanded === 'panel5' ? <ExpandLess sx={{ color: '#404040' }} /> : <ExpandMore sx={{ color: '#404040' }} />}
              </IconButton>
            </Typography>
            <Collapse in={expanded === 'panel5'}>
              <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
                The only cost in MarketMate is 0.5 Solana to access the token/points creation feature, plus the Solana network fee for creating a token with metadata.
              </Typography>
            </Collapse>
          </Paper>
        </Box>

        {/* Contact Us Section */}
        <Box sx={{ padding: 4, backgroundColor: '#e0f7fa', borderRadius: 2, marginBottom: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#404040' }}>
            Contact Us
          </Typography>
          <Typography paragraph sx={{ fontWeight: 'bold', color: '#404040' }}>
            Have questions or need assistance? Our team is here to help. Reach out to us at market.mate.fidelity@gmail.com.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
