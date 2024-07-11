import React, { useEffect, useState, MouseEvent } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc, getDoc } from '../firebase';
import logo from '../assets/logo.png'; 

const NavBar: React.FC = () => {
  const [user] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileImage(data.profileImage || '');
            setName(data.name || '');
          }
        } catch (error) {
          console.error('Error fetching user profile: ', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #4da398 70%, #90c0c7 30%)' }}>
      <Toolbar>
        <img src={logo} alt="MarketMate Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MarketMate
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/directory">
          MarketConnect
        </Button>
        {!user ? (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        ) : (
          <>
            <IconButton color="inherit" onClick={handleMenu}>
              <Avatar
                src={profileImage || ''}
                alt={name}
                sx={{ border: '2px solid white', width: 40, height: 40 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
