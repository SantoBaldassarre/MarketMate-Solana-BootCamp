import React, { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';  // Assicurati che il percorso sia corretto
import { 
  Card, 
  CardContent, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  Grid, 
  Avatar 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Token {
  mintAccount: string;
  tokenAta: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  sellerFee: number;
  creators: { address: string; verified: boolean; share: number }[];
  metadataUri: string;
  transactionId: string;
  amount?: number;  // Aggiungi la quantità opzionale
}

const TokenList: React.FC<{ publicKey: string, connection: Connection }> = ({ publicKey, connection }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        // Recupera tutti i token associati all'account del wallet
        const accounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(publicKey), 
          { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
        );

        const mintAccounts = accounts.value.map((account: any) => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount
        }));

        // Suddividi i mintAccounts in gruppi di massimo 30
        const chunkSize = 30;
        const tokenChunks = [];
        for (let i = 0; i < mintAccounts.length; i += chunkSize) {
          tokenChunks.push(mintAccounts.slice(i, i + chunkSize));
        }

        // Recupera i token dal database per ogni gruppo di mintAccounts
        const tokensData: Token[] = [];
        for (const chunk of tokenChunks) {
          const mintChunk = chunk.map(item => item.mint);
          const q = query(collection(db, 'tokenMetadata'), where('mintAccount', 'in', mintChunk));
          const querySnapshot = await getDocs(q);
          const chunkData = querySnapshot.docs.map(doc => {
            const data = doc.data() as Token;
            const tokenAccount = chunk.find(item => item.mint === data.mintAccount);
            return { ...data, amount: tokenAccount ? tokenAccount.amount : 0 };
          });
          tokensData.push(...chunkData);
        }

        setTokens(tokensData);
      } catch (error) {
        console.error('Error fetching tokens from Firebase:', error);
        setError('Error fetching tokens. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  if (loading) {
    return <div>Loading tokens...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Tokens</h2>
      {tokens.length > 0 ? (
        tokens.map((token, index) => (
          <Card key={index} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar 
                    src={token.imageUrl} 
                    alt={token.name} 
                    sx={{ width: 56, height: 56 }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5">{token.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Symbol: {token.symbol}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {token.amount}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>More Info</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  <strong>Description:</strong> {token.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Mint Account:</strong> {token.mintAccount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Token ATA:</strong> {token.tokenAta}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Transaction ID:</strong> <a href={`https://explorer.solana.com/tx/${token.transactionId}?cluster=devnet`} target="_blank" rel="noopener noreferrer">{token.transactionId}</a>
                </Typography>
                {token.creators && token.creators.map((creator, idx) => (
                  <Box key={idx} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Creator Address:</strong> {creator.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Verified:</strong> {creator.verified ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Share:</strong> {creator.share}%
                    </Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Card>
        ))
      ) : (
        <p>No tokens found.</p>
      )}
    </div>
  );
};

export default TokenList;
