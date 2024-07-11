import React, { useState, useEffect, useCallback } from 'react';
import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { Box, Button, TextField, Typography, Avatar, Grid, MenuItem, Select, SelectChangeEvent, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { transferToken } from './splTransfer';
import UserSearch, { UserType } from '../UserSearch';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Token {
  mintAccount: string;
  amount: number;
  name: string;
  imageUrl: string;
  symbol: string;
  description: string;
  tokenAta: string;
  sellerFee: number;
  creators: { address: string; verified: boolean; share: number }[];
  metadataUri: string;
  transactionId: string;
  decimals: number;  // Aggiungi questa proprietà
}

interface SolanaTokenTransferProps {
  connection: Connection;
  wallet: Keypair;
  tokens: Token[];
  decimals: number; // Aggiungi questa proprietà
}

const SolanaTokenTransfer: React.FC<SolanaTokenTransferProps> = ({ connection, wallet, tokens, decimals }) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [destination, setDestination] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [followers, setFollowers] = useState<UserType[]>([]);
  const [role, setRole] = useState<string>('');

  const fetchUserRole = useCallback(async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', wallet.publicKey.toBase58()));
      if (userDoc.exists()) {
        setRole(userDoc.data().role);
        console.log('User role:', userDoc.data().role); // Log per verifica
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, [wallet]);

  const fetchFollowers = useCallback(async () => {
    if (role === 'business-owner') {
      try {
        const q = query(collection(db, 'users'), where('following', 'array-contains', wallet.publicKey.toBase58()));
        const querySnapshot = await getDocs(q);
        const followersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
        console.log('Fetched followers:', followersData); // Log per verifica
        setFollowers(followersData);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    }
  }, [role, wallet]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  useEffect(() => {
    if (role === 'business-owner') {
      fetchFollowers();
    }
  }, [fetchFollowers, role]);

  const handleTokenChange = (event: SelectChangeEvent<string>) => {
    const mintAccount = event.target.value;
    const token = tokens.find(t => t.mintAccount === mintAccount);
    setSelectedToken(token || null);
  };

  const handleTransfer = async () => {
    if (!selectedToken || !destination || amount <= 0) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setTransferStatus('Transferring...');
      setLoading(true);
      const signature = await transferToken(
        connection,
        wallet,
        new PublicKey(selectedToken.mintAccount),
        new PublicKey(destination),
        amount,
        selectedToken.decimals // Usa i decimali del token selezionato
      );
      setTransferStatus(`Transfer successful. Transaction signature: ${signature}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error transferring token:', error);
        setTransferStatus(`Error transferring token: ${error.message}`);
      } else {
        console.error('Unexpected error transferring token:', error);
        setTransferStatus('Unexpected error transferring token.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserType) => {
    setDestination(user.publicKey);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Transfer Token
      </Typography>
      <Select
        fullWidth
        value={selectedToken ? selectedToken.mintAccount : ''}
        onChange={handleTokenChange}
        displayEmpty
      >
        <MenuItem value="" disabled>Select Token</MenuItem>
        {tokens.map((token) => (
          <MenuItem key={token.mintAccount} value={token.mintAccount}>
            <Grid container alignItems="center">
              <Grid item>
                <Avatar src={token.imageUrl} alt={token.name} sx={{ width: 24, height: 24, mr: 1 }} />
              </Grid>
              <Grid item>
                {token.name} ({token.amount})
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Select>
      {selectedToken && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Send {selectedToken.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <UserSearch onSelectUser={handleUserSelect} />
            {role === 'business-owner' && (
              <Select
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                displayEmpty
                sx={{ mt: 2 }}
              >
                <MenuItem value="" disabled>Select Follower</MenuItem>
                {followers.map((follower) => (
                  <MenuItem key={follower.id} value={follower.publicKey}>
                    {follower.email} - {follower.publicKey || 'No Public Key'}
                  </MenuItem>
                ))}
              </Select>
            )}
            <TextField
              fullWidth
              label="Destination Address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleTransfer}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              Transfer
            </Button>
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {transferStatus && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {transferStatus}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default SolanaTokenTransfer;
