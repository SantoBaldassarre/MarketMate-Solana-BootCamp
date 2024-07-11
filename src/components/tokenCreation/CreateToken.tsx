import React, { useState, useEffect, useCallback } from 'react';
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, createAssociatedTokenAccount } from '@solana/spl-token';
import { fetchKeypair } from '../../utils/wallet';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Button, CircularProgress, Typography, Alert, Box } from '@mui/material';

interface CreateTokenProps {
  onTokenCreated: (details: { mint: string; tokenAccount: string }) => void;
}

const CreateToken: React.FC<CreateTokenProps> = ({ onTokenCreated }) => {
  const [connection] = useState(new Connection('https://api.devnet.solana.com'));
  const [user] = useAuthState(auth);
  const [tokenCreated, setTokenCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkIfTokenCreated = async () => {
      if (!user) return;
      const tokensQuery = query(
        collection(db, 'tokens'),
        where('ownerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(tokensQuery);
      if (!querySnapshot.empty) {
        setTokenCreated(true);
      }
    };

    checkIfTokenCreated();
  }, [user]);

  const saveTokenMetadataToFirebase = async (metadata: any) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const tokensCollection = collection(db, 'tokens');
      await addDoc(tokensCollection, {
        ...metadata,
        ownerId: user.uid,
      });
      console.log('Token metadata saved successfully');
    } catch (error) {
      console.error('Error saving token metadata: ', error);
      setError('Error saving token metadata. Please try again.');
    }
  };

  const createToken = useCallback(async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!user) {
        setError('User not authenticated');
        return;
      }

      if (tokenCreated) {
        setError('Hai già creato un token.');
        return;
      }

      setLoading(true);

      const payer = await fetchKeypair(user);

      // Check balance of the payer account
      const balance = await connection.getBalance(payer.publicKey);
      console.log('Payer balance:', balance / LAMPORTS_PER_SOL, 'SOL');

      // Crea il Token Mint
      const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null,
        9 // Decimali
      );

      console.log('Token mint created:', mint.toBase58());

      // Crea l'ATA (Token Account Associato)
      const tokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
      );

      console.log('Token account created:', tokenAccount.toBase58());

      // Preparare i metadati
      const metadata = {
        mintAccount: mint.toBase58(),
        tokenAta: tokenAccount.toBase58(),
        userId: user.uid,
        ownerId: user.uid,
      };

      // Salvare i metadati su Firebase
      await saveTokenMetadataToFirebase(metadata);

      onTokenCreated({
        mint: mint.toBase58(),
        tokenAccount: tokenAccount.toBase58()
      });

      setSuccess('Token and associated token account created successfully.');
      setTokenCreated(true);
    } catch (error) {
      console.error('Error creating token:', error);
      setError('Error creating token. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [connection, user, tokenCreated, onTokenCreated]);

  return (
    <Box sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create Token
      </Typography>
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          {success}
        </Alert>
      )}
      <Box textAlign="center" sx={{ marginTop: 2 }}>
        {!tokenCreated && (
          <Button
            variant="contained"
            color="primary"
            onClick={createToken}
            disabled={loading}
            sx={{ marginBottom: 2 }}
          >
            Crea Token
          </Button>
        )}
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginTop: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Token creation in progress...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CreateToken;
