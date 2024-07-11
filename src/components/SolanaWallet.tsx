import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress, MenuItem, Select, Accordion, AccordionSummary,
  AccordionDetails, Paper, Snackbar, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Keypair, PublicKey, Connection, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction
} from '@solana/web3.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc, getDoc, setDoc, collection, query, where, getDocs } from '../firebase';
import UserSearch, { UserType } from './UserSearch';
import { SelectChangeEvent } from '@mui/material/Select';
import TokenList from './tokenCreation/TokenList';
import SolanaTokenTransfer, { Token } from './tokenCreation/SolanaTokenTransfer';
import CryptoJS from 'crypto-js';

const SolanaWallet: React.FC = () => {
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [backupKey, setBackupKey] = useState<string>('');
  const [user] = useAuthState(auth);
  const [balance, setBalance] = useState<number | null>(null);
  const [airdropStatus, setAirdropStatus] = useState<string>('');
  const [showBackupKey, setShowBackupKey] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [followers, setFollowers] = useState<UserType[]>([]);
  const [role, setRole] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const connection = useMemo(() => new Connection('https://api.devnet.solana.com'), []);

  const fetchBalance = useCallback(async (publicKey: PublicKey) => {
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      setSnackbarMessage('Error fetching balance');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error fetching balance:', error);
    }
  }, [connection]);

  const fetchTokens = useCallback(async (publicKey: PublicKey) => {
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      const mintAccounts = accounts.value.map((account: any) => ({
        mintAccount: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals // Aggiungi decimali qui
      }));

      const chunkSize = 30;
      const tokenChunks = [];
      for (let i = 0; i < mintAccounts.length; i += chunkSize) {
        tokenChunks.push(mintAccounts.slice(i, i + chunkSize));
      }

      const tokensData: Token[] = [];
      for (const chunk of tokenChunks) {
        const mintChunk = chunk.map(item => item.mintAccount);
        const q = query(collection(db, 'tokenMetadata'), where('mintAccount', 'in', mintChunk));
        const querySnapshot = await getDocs(q);
        const chunkData = querySnapshot.docs.map(doc => {
          const data = doc.data() as Token;
          const tokenAccount = chunk.find(item => item.mintAccount === data.mintAccount);
          return { ...data, amount: tokenAccount ? tokenAccount.amount : 0, decimals: tokenAccount?.decimals || 0 };
        });
        tokensData.push(...chunkData);
      }

      setTokens(tokensData);
    } catch (error) {
      setSnackbarMessage('Error fetching tokens');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error fetching tokens:', error);
    }
  }, [connection]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user) {
        const docRef = doc(db, 'wallets', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const encryptedKey = docSnap.data().secretKey;
          const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, user.uid).toString(CryptoJS.enc.Utf8);
          const keypairFromStorage = Keypair.fromSecretKey(new Uint8Array(JSON.parse(decryptedKey)));
          setKeypair(keypairFromStorage);
          setBackupKey(Buffer.from(keypairFromStorage.secretKey).toString('hex'));
          await fetchBalance(keypairFromStorage.publicKey);
          await fetchTokens(keypairFromStorage.publicKey);
        }
      }
    };

    const fetchFollowers = async () => {
      if (user && role === 'business-owner') {
        try {
          const q = query(collection(db, 'users'), where('following', 'array-contains', user.uid));
          const querySnapshot = await getDocs(q);
          const followersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
          setFollowers(followersData);
        } catch (error) {
          setSnackbarMessage('Error fetching followers');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          console.error('Error fetching followers:', error);
        }
      }
    };

    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    };

    fetchWallet();
    fetchUserRole();
    fetchFollowers();
  }, [user, fetchBalance, fetchTokens, role]);

  const createWallet = async () => {
    if (user) {
      const newKeypair = Keypair.generate();
      setKeypair(newKeypair);
      setBackupKey(Buffer.from(newKeypair.secretKey).toString('hex'));
      const publicKey = newKeypair.publicKey.toBase58();

      const encryptedKey = CryptoJS.AES.encrypt(JSON.stringify(Array.from(newKeypair.secretKey)), user.uid).toString();

      await setDoc(doc(db, 'wallets', user.uid), {
        secretKey: encryptedKey,
        publicKey,
      });

      await setDoc(doc(db, 'users', user.uid), {
        publicKey,
      }, { merge: true });

      await fetchBalance(newKeypair.publicKey);
      await fetchTokens(newKeypair.publicKey);
      setSnackbarMessage('Wallet created successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleBackup = () => {
    const element = document.createElement("a");
    const file = new Blob([backupKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "solana_wallet_backup.txt";
    document.body.appendChild(element);
    element.click();
    setSnackbarMessage('Backup key downloaded');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const requestAirdrop = async () => {
    if (keypair) {
      try {
        setAirdropStatus('Requesting airdrop...');
        const airdropSignature = await connection.requestAirdrop(keypair.publicKey, 5 * LAMPORTS_PER_SOL);

        const latestBlockhash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
          signature: airdropSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        });

        setAirdropStatus('Airdrop successful!');
        setSnackbarMessage('Airdrop successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        await fetchBalance(keypair.publicKey);
      } catch (error) {
        setAirdropStatus('Airdrop failed. Please try again.');
        setSnackbarMessage('Airdrop failed');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error('Error requesting airdrop:', error);
      }
    }
  };

  const sendSol = async () => {
    if (keypair && recipientAddress && amount) {
      setIsSending(true);
      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

        setSnackbarMessage('Transaction successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        await fetchBalance(keypair.publicKey);
      } catch (error) {
        setSnackbarMessage('Transaction failed. Please check the details and try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error('Error sending SOL:', error);
      } finally {
        setIsSending(false);
      }
    } else {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const toggleBackupKeyVisibility = () => {
    setShowBackupKey(!showBackupKey);
  };

  const handleSelectUser = (event: SelectChangeEvent<string>) => {
    const selectedUser = followers.find(follower => follower.id === event.target.value as string);
    if (selectedUser) {
      setRecipientAddress(selectedUser.publicKey);
    } else {
      setRecipientAddress('');
    }
  };

  const handleUserSearchSelect = (user: UserType) => {
    setRecipientAddress(user.publicKey);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
        Solana Wallet
      </Typography>
      {keypair ? (
        <div>
          <Typography>Public Key: <TextField
            fullWidth
            margin="normal"
            value={keypair.publicKey.toBase58()}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 2, wordWrap: 'break-word' }}
          /></Typography>
          <Typography>Balance: {balance !== null ? `${balance} SOL` : 'Loading...'}</Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Tokens</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TokenList publicKey={keypair.publicKey.toBase58()} connection={connection} />
              <SolanaTokenTransfer connection={connection} wallet={keypair} tokens={tokens} decimals={tokens[0]?.decimals || 0} />
            </AccordionDetails>
          </Accordion>
          <Button variant="contained" color="secondary" onClick={toggleBackupKeyVisibility} sx={{ mt: 2 }}>
            {showBackupKey ? 'Hide Backup Key' : 'Show Backup Key'}
          </Button>
          {showBackupKey && (
            <div>
              <TextField
                fullWidth
                margin="normal"
                label="Backup Key"
                value={backupKey}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />
              <Button variant="contained" color="secondary" onClick={handleBackup} sx={{ mt: 2 }}>
                Download Backup Key
              </Button>
            </div>
          )}
          <Button variant="contained" color="primary" onClick={requestAirdrop} sx={{ mt: 2 }}>
            Request Airdrop
          </Button>
          {airdropStatus && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {airdropStatus}
            </Typography>
          )}
          <Box mt={4}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Send SOL</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {role === 'business-owner' && (
                  <Select
                    fullWidth
                    value={recipientAddress || ''}
                    onChange={handleSelectUser}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select Follower</MenuItem>
                    {followers.map((follower) => (
                      <MenuItem key={follower.id} value={follower.id}>
                        {follower.email} - {follower.publicKey || 'No Public Key'}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <UserSearch onSelectUser={handleUserSearchSelect} />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Recipient Address"
                  value={recipientAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Amount (SOL)"
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
                <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendSol}
                    disabled={isSending}
                  >
                    Send SOL
                  </Button>
                  {isSending && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </div>
      ) : (
        <Button variant="contained" color="primary" onClick={createWallet}>
          Create Wallet
        </Button>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SolanaWallet;
