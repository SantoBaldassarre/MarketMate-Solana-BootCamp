import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, Collapse, CircularProgress, Alert } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import CreateToken from './tokenCreation/CreateToken';
import CreateMetadataForm from './tokenCreation/CreateMetadataForm';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc, getDoc, query, collection, where, getDocs } from '../firebase';
import { Keypair, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import CryptoJS from 'crypto-js';

interface TokenDetails {
  mint: string;
  tokenAccount: string;
}

const CreateTokenClient: React.FC = () => {
  const [openCreateToken, setOpenCreateToken] = useState(false);
  const [openMetadataForm, setOpenMetadataForm] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [tokenAccount, setTokenAccount] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [user] = useAuthState(auth);
  const [hasToken, setHasToken] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const FEE_IN_SOL = 0.5;
  const FEE_RECEIVER_ADDRESS = "EfsC9w6MTUc4CfeF1EXniS7jWMWYzA1hs5V5j9s1ebLs";

  const handleTokenCreated = ({ mint, tokenAccount }: TokenDetails) => {
    console.log('Token created:', { mint, tokenAccount });
    setMintAddress(mint);
    setTokenAccount(tokenAccount);
    setHasToken(true);
    setOpenMetadataForm(true);
  };

  const handleMetadataCreated = (metadata: any) => {
    setMetadata(metadata);
    setHasMetadata(true);
  };

  const fetchWallet = useCallback(async () => {
    if (user) {
      const docRef = doc(db, 'wallets', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const encryptedKey = docSnap.data().secretKey;
        const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, user.uid).toString(CryptoJS.enc.Utf8);
        try {
          const secretKeyArray = Uint8Array.from(JSON.parse(decryptedKey));
          const keypairFromStorage = Keypair.fromSecretKey(secretKeyArray);
          setKeypair(keypairFromStorage);
        } catch (error) {
          console.error('Error parsing decrypted key:', error);
          throw new Error('Decryption failed. Invalid key.');
        }
      }
    }
  }, [user]);

  const checkIfTokenAndMetadataCreated = useCallback(async () => {
    if (user) {
      const tokensQuery = query(
        collection(db, 'tokens'),
        where('ownerId', '==', user.uid)
      );
      const tokenSnapshot = await getDocs(tokensQuery);
      if (!tokenSnapshot.empty) {
        setHasToken(true);
        const tokenData = tokenSnapshot.docs[0].data();
        setMintAddress(tokenData.mintAccount);
        setTokenAccount(tokenData.tokenAta);

        const metadataQuery = query(
          collection(db, 'tokenMetadata'),
          where('ownerId', '==', user.uid),
          where('mintAccount', '==', tokenData.mintAccount)
        );
        const metadataSnapshot = await getDocs(metadataQuery);
        if (!metadataSnapshot.empty) {
          setHasMetadata(true);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
    checkIfTokenAndMetadataCreated();
  }, [fetchWallet, checkIfTokenAndMetadataCreated]);

  const handlePayFee = async () => {
    if (!keypair) {
      setError('Keypair not found. Please make sure you are logged in.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(FEE_RECEIVER_ADDRESS),
          lamports: FEE_IN_SOL * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
      setSuccess(`Fee paid successfully. Transaction signature: ${signature}`);
      setOpenCreateToken(true);
    } catch (error) {
      console.error('Error paying fee:', error);
      setError('Error paying fee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Pay 0.5 SOL to unlock the feature to create your spl20 points.</Typography>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        {!openCreateToken && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handlePayFee} 
            sx={{ marginTop: 2 }}
            disabled={loading || hasToken}
          >
            Pay 0.5 SOL to Create Token
          </Button>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginTop: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Processing payment...
            </Typography>
          </Box>
        )}
        <Collapse in={openCreateToken}>
          <CreateToken onTokenCreated={handleTokenCreated} />
        </Collapse>
      </Paper>
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        {hasToken && !hasMetadata && (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpenMetadataForm(!openMetadataForm)} 
              sx={{ marginTop: 2 }}
              endIcon={openMetadataForm ? <ExpandLess /> : <ExpandMore />}
            >
              {openMetadataForm ? 'Nascondi Crea Metadati' : 'Mostra Crea Metadati'}
            </Button>
            <Collapse in={openMetadataForm}>
              {keypair && mintAddress && tokenAccount && (
                <CreateMetadataForm 
                  connection={connection}
                  mint={new PublicKey(mintAddress)}
                  userTokenAccountAddress={new PublicKey(tokenAccount)}
                  onMetadataCreated={handleMetadataCreated}
                />
              )}
            </Collapse>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CreateTokenClient;
