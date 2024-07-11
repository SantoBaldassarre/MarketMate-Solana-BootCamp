import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { auth, db, setDoc, doc, getDoc, getDocs, query, where, collection } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { mintToken } from '../tokenCreation/splMint';
import { transferToken } from '../tokenCreation/splTransfer';
import UserSearch, { UserType } from '../UserSearch';
import CryptoJS from 'crypto-js';

interface PurchaseItem {
  itemName: string;
  quantity: number;
}

const AssignPoints: React.FC = () => {
  const [user] = useAuthState(auth);
  const [customer, setCustomer] = useState<UserType | null>(null);
  const [points, setPoints] = useState('');
  const [airdropPoints, setAirdropPoints] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([{ itemName: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [followers, setFollowers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const [wallet, setWallet] = useState<Keypair | null>(null);
  const [mintAccount, setMintAccount] = useState<PublicKey | null>(null);
  const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);
  const [pointsValue, setPointsValue] = useState<number | null>(null); 
  const decimals = 9; 

  useEffect(() => {
    const fetchWallet = async () => {
      if (user) {
        const docRef = doc(db, 'wallets', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const encryptedKey = docSnap.data().secretKey;
          const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, user.uid).toString(CryptoJS.enc.Utf8);
          try {
            const secretKeyArray = Uint8Array.from(JSON.parse(decryptedKey));
            const keypairFromStorage = Keypair.fromSecretKey(secretKeyArray);
            setWallet(keypairFromStorage);
            console.log('Wallet fetched successfully:', keypairFromStorage.publicKey.toBase58());
          } catch (error) {
            console.error('Error parsing decrypted key:', error);
            setError('Error fetching wallet. Please try again.');
          }
        }
      }
    };

    fetchWallet();
  }, [user]);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (user) {
        try {
          const tokensQuery = query(
            collection(db, 'tokens'),
            where('ownerId', '==', user.uid)
          );
          const querySnapshot = await getDocs(tokensQuery);
          if (!querySnapshot.empty) {
            const tokenData = querySnapshot.docs[0].data();
            setMintAccount(new PublicKey(tokenData.mintAccount));
            setTokenAccount(new PublicKey(tokenData.tokenAta));
            console.log('Token details fetched successfully');
          } else {
            console.log('No token found for user:', user.uid);
          }
        } catch (error) {
          console.error('Error fetching token details:', error);
          setError('Error fetching token details.');
        }
      }
    };

    fetchTokenDetails();
  }, [user]);

  useEffect(() => {
    const fetchPointsConfiguration = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'pointsConfiguration', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPointsValue(data.pointsValue);
            console.log('Points configuration fetched successfully');
          }
        } catch (error) {
          console.error('Error fetching points configuration:', error);
          setError('Error fetching points configuration.');
        }
      }
    };

    fetchPointsConfiguration();
  }, [user]);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'users'), where('following', 'array-contains', user.uid));
          const querySnapshot = await getDocs(q);
          const followersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserType));
          setFollowers(followersData);
          console.log('Followers fetched successfully:', followersData);
        } catch (error) {
          console.error('Error fetching followers:', error);
          setError('Error fetching followers.');
        }
      }
    };

    fetchFollowers();
  }, [user]);

  const handleAssignPoints = async () => {
    if (pointsValue === null) { 
      setError('Please configure the points value before assigning points.');
      return;
    }

    if (!customer || !points || !wallet || !mintAccount || !tokenAccount || purchaseItems.some(item => !item.itemName || !item.quantity)) {
      setError('Please provide all necessary details');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const pointsAmount = parseInt(points, 10);
      const tokensAmount = pointsAmount * pointsValue; 
      const recipientPublicKey = new PublicKey(customer.publicKey);

      console.log('Minting tokens...');
      const mintSignature = await mintToken(
        connection,
        wallet,
        mintAccount,
        tokensAmount,
        tokenAccount,
        decimals
      );
      console.log('Tokens minted successfully:', mintSignature);

      console.log('Transferring tokens to recipient...');
      const transferSignature = await transferToken(
        connection,
        wallet,
        mintAccount,
        recipientPublicKey,
        tokensAmount,
        decimals
      );
      console.log('Tokens transferred successfully:', transferSignature);

      console.log('Saving assignment to the database...');
      await setDoc(doc(db, 'points', `${customer.id}_${new Date().getTime()}`), {
        points: pointsAmount,
        tokens: tokensAmount, 
        purchaseItems,
        assignedBy: user?.uid,
        assignedAt: new Date().toISOString(),
        userId: customer.id,
        userEmail: customer.email,
        userPublicAddress: customer.publicKey,
        mintTransactionSignature: mintSignature,
        transferTransactionSignature: transferSignature
      });
      console.log('Assignment saved successfully');

      setSuccess('Points assigned and tokens minted and transferred successfully');
    } catch (error) {
      console.error('Error assigning points:', error);
      setError('Error assigning points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAirdrop = async () => {
    if (pointsValue === null) { 
      setError('Please configure the points value before performing an airdrop.');
      return;
    }

    if (!airdropPoints || !wallet || !mintAccount || !tokenAccount || followers.length === 0) {
      setError('Please provide all necessary details for the airdrop');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const pointsAmount = parseInt(airdropPoints, 10);
      const tokensAmount = pointsAmount * pointsValue; 

      for (const follower of followers) {
        const recipientPublicKey = new PublicKey(follower.publicKey);

        console.log(`Minting tokens for ${follower.email}...`);
        const mintSignature = await mintToken(
          connection,
          wallet,
          mintAccount,
          tokensAmount,
          tokenAccount,
          decimals
        );
        console.log(`Tokens minted successfully for ${follower.email}:`, mintSignature);

        console.log(`Transferring tokens to ${follower.email}...`);
        const transferSignature = await transferToken(
          connection,
          wallet,
          mintAccount,
          recipientPublicKey,
          tokensAmount,
          decimals
        );
        console.log(`Tokens transferred successfully to ${follower.email}:`, transferSignature);

        console.log(`Saving assignment to the database for ${follower.email}...`);
        await setDoc(doc(db, 'points', `${follower.id}_${new Date().getTime()}`), {
          points: pointsAmount,
          tokens: tokensAmount, // Salva il numero di token assegnati
          purchaseItems: [], // Airdrop non ha elementi di acquisto
          assignedBy: user?.uid,
          assignedAt: new Date().toISOString(),
          userId: follower.id,
          userEmail: follower.email,
          userPublicAddress: follower.publicKey,
          mintTransactionSignature: mintSignature,
          transferTransactionSignature: transferSignature,
          airdrop: true // Indica che questa assegnazione è parte di un airdrop
        });
        console.log(`Assignment saved successfully for ${follower.email}`);
      }

      setSuccess('Airdrop completed successfully');
    } catch (error) {
      console.error('Error performing airdrop:', error);
      setError('Error performing airdrop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = purchaseItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setPurchaseItems(updatedItems);
    console.log('Updated purchase items:', updatedItems);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { itemName: '', quantity: 1 }]);
    console.log('Added new purchase item. Current items:', purchaseItems);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assign Points
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <UserSearch onSelectUser={setCustomer} />
      {customer && (
        <Box>
          <Typography variant="h6">Selected User: {customer.email}</Typography>
          <TextField
            label="Points"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
          />
          {purchaseItems.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}>
              <TextField
                label="Item Name"
                value={item.itemName}
                onChange={(e) => handlePurchaseItemChange(index, 'itemName', e.target.value)}
                variant="outlined"
              />
              <TextField
                label="Quantity"
                value={item.quantity}
                onChange={(e) => handlePurchaseItemChange(index, 'quantity', parseInt(e.target.value))}
                type="number"
                variant="outlined"
              />
            </Box>
          ))}
          <Button variant="contained" color="primary" onClick={addPurchaseItem} sx={{ marginBottom: 2 }}>
            Add Item
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignPoints}
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Assign Points'}
          </Button>
        </Box>
      )}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
        Airdrop Points to Followers
      </Typography>
      <TextField
        label="Airdrop Points"
        value={airdropPoints}
        onChange={(e) => setAirdropPoints(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        type="number"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAirdrop}
        disabled={loading}
        sx={{ marginTop: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Airdrop Points'}
      </Button>
    </Box>
  );
};

export default AssignPoints;
