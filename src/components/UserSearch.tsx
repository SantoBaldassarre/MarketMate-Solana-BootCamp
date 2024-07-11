import React, { useState, ChangeEvent } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { getUsersByEmail } from '../services/userService'; 

export interface UserType {
  id: string;
  email: string;
  publicKey: string;
}

interface UserSearchProps {
  onSelectUser: (user: UserType) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UserType[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users: UserType[] = await getUsersByEmail(email);
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Search Users by Email
      </Typography>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        Search
      </Button>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      <Box mt={4}>
        {users.map((user) => (
          <Box key={user.id} mb={2} sx={{ textAlign: 'left' }}>
            <Typography>Email: {user.email}</Typography>
            <Typography>Public Key: {user.publicKey}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onSelectUser(user)}
              sx={{ mt: 1 }}
            >
              Select
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UserSearch;
