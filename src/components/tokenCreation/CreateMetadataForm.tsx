import React, { useState, useEffect } from 'react';
import UploadImage from './UploadImage';
import { PublicKey as SolanaPublicKey, Connection, Keypair } from '@solana/web3.js';
import { createMetadata } from './splMetadata';
import { Creator } from '@metaplex-foundation/mpl-token-metadata';
import { fetchKeypair } from '../../utils/wallet';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import { TextField, Button, CircularProgress, Typography, Paper, Box, Alert } from '@mui/material';

interface CreateMetadataFormProps {
  connection: Connection;
  mint: SolanaPublicKey;
  userTokenAccountAddress: SolanaPublicKey;
  onMetadataCreated: (metadata: any) => void;
}

const CreateMetadataForm: React.FC<CreateMetadataFormProps> = ({ connection, mint, userTokenAccountAddress, onMetadataCreated }) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Keypair | null>(null);
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [metadataCreated, setMetadataCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async (user: any) => {
      try {
        const keypair = await fetchKeypair(user);
        setWallet(keypair);
      } catch (error) {
        console.error('Error fetching wallet:', error);
        setError('Error fetching wallet. Please try again.');
      }
    };

    if (user) {
      fetchWallet(user);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (imageUrl && wallet && user) {
      const creatorPublicKey = umiPublicKey(wallet.publicKey.toBase58());

      const creatorsList: Creator[] = [{
        address: creatorPublicKey,
        verified: true,
        share: 100,
      }];

      try {
        console.log('Creating metadata with the following details:');
        console.log('Name:', name);
        console.log('Symbol:', symbol);
        console.log('Description:', description);
        console.log('Image URL:', imageUrl);
        console.log('Creators:', creatorsList);

        setLoading(true);
        setError(null);
        setSuccess(null);

        const metadata = await createMetadata(
          connection,
          wallet,
          mint,
          userTokenAccountAddress,
          name,
          symbol,
          description,
          imageUrl,
          500, // Seller fee is fixed to 500
          creatorsList,
          user
        );

        console.log('Metadata created successfully', metadata);
        onMetadataCreated(metadata);
        setSuccess('Metadata created successfully.');
        setMetadataCreated(true);
      } catch (error) {
        console.error('Error creating metadata:', error);
        setError('Error creating metadata. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Image URL, wallet, or user is missing');
      console.error('Image URL, wallet, or user is missing');
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create Metadata
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
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
        <UploadImage onImageUploaded={setImageUrl} />
        {!metadataCreated && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            Create Metadata
          </Button>
        )}
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginTop: 2 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Metadata creation in progress...
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CreateMetadataForm;
