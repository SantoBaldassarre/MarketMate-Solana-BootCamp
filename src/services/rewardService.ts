import { db, doc, updateDoc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp } from '../firebase';
import { burnToken } from '../components/tokenCreation/splBurn';
import { PublicKey, Connection } from '@solana/web3.js';
import { fetchKeypair } from '../utils/wallet';


export const getRewards = async (): Promise<any[]> => {
  const rewardsQuery = query(collection(db, 'rewards'));
  const querySnapshot = await getDocs(rewardsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const createReward = async (title: string, description: string, points: number, imageUrl: string, ownerId: string, quantity: number): Promise<void> => {
  await setDoc(doc(collection(db, 'rewards')), {
    title,
    description,
    points,
    image: imageUrl,
    ownerId,
    quantity, 
    createdAt: serverTimestamp(),
  });
};


export const claimReward = async (rewardId: string, userId: string): Promise<void> => {
  console.log('Starting claimReward function with rewardId:', rewardId, 'and userId:', userId);

  const rewardDoc = await getDoc(doc(db, 'rewards', rewardId));
  if (!rewardDoc.exists()) {
    console.error('Reward does not exist');
    throw new Error('Reward does not exist');
  }

  const rewardData = rewardDoc.data();

  if (rewardData.quantity <= 0) {
    console.error('Reward quantity is insufficient');
    throw new Error('Reward quantity is insufficient');
  }

  const claimId = doc(collection(db, 'claims')).id;
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userEmail = userDoc.exists() ? userDoc.data()!.email : 'Unknown';

  console.log('Creating claim document with claimId:', claimId);
  await setDoc(doc(db, 'claims', claimId), {
    rewardId,
    userId,
    userEmail,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
    businessOwnerId: rewardData!.ownerId
  });

  console.log('Claim document created successfully');

  
  await updateDoc(doc(db, 'rewards', rewardId), {
    quantity: rewardData!.quantity - 1
  });

  console.log('Reward quantity decremented');
};


export const confirmRewardClaim = async (claimId: string, businessOwnerId: string): Promise<void> => {
  console.log('Starting confirmRewardClaim function with claimId:', claimId, 'and businessOwnerId:', businessOwnerId);

  const claimDoc = await getDoc(doc(db, 'claims', claimId));
  if (!claimDoc.exists()) {
    console.error('Claim does not exist');
    throw new Error('Claim does not exist');
  }

  const claimData = claimDoc.data();
  if (claimData!.status !== 'pending') {
    console.error('Claim is not pending');
    throw new Error('Claim is not pending');
  }

  await updateDoc(doc(db, 'claims', claimId), {
    status: 'approved',
    approvedBy: businessOwnerId,
  });

  console.log('Claim status updated to approved');
};


export const confirmUserRewardClaim = async (claimId: string, user: any, tokenData: any): Promise<void> => {
  console.log('Starting confirmUserRewardClaim function with claimId:', claimId);

  const claimDoc = await getDoc(doc(db, 'claims', claimId));
  if (!claimDoc.exists()) {
    console.error('Claim does not exist');
    throw new Error('Claim does not exist');
  }

  const claimData = claimDoc.data();
  if (claimData!.status !== 'approved') {
    console.error('Claim is not approved');
    throw new Error('Claim is not approved');
  }

  console.log('Claim Data:', claimData);
  console.log('Token Data:', tokenData);

  const userWallet = await fetchKeypair(user);
  const mint = new PublicKey(tokenData.mintAccount);
  const tokenAccount = new PublicKey(tokenData.tokenAta);

  const pointsConfigQuery = query(
    collection(db, 'pointsConfiguration'),
    where('configuredBy', '==', tokenData.ownerId)
  );
  const pointsConfigSnapshot = await getDocs(pointsConfigQuery);
  if (pointsConfigSnapshot.empty) {
    console.error('Points configuration not found');
    throw new Error('Points configuration not found');
  }
  const pointsConfigData = pointsConfigSnapshot.docs[0].data();
  const pointsValue = pointsConfigData.pointsValue;

  console.log('Points Configuration Data:', pointsConfigData);
  console.log('Points Value:', pointsValue);

  const rewardDoc = await getDoc(doc(db, 'rewards', claimData.rewardId));
  if (!rewardDoc.exists()) {
    console.error('Reward not found');
    throw new Error('Reward not found');
  }
  const rewardData = rewardDoc.data();
  const rewardPoints = rewardData.points;

  console.log('Reward Data:', rewardData);
  console.log('Reward Points:', rewardPoints);

  
  const tokenAmount = rewardPoints * pointsValue * Math.pow(10, 9);

  console.log('Mint:', mint.toBase58());
  console.log('Token Account:', tokenAccount.toBase58());
  console.log('Token Amount:', tokenAmount);
  console.log('User Wallet:', userWallet.publicKey.toBase58());

  if (!mint || !userWallet || !tokenAccount || typeof tokenAmount !== 'number' || isNaN(tokenAmount)) {
    console.error('Invalid claim data');
    throw new Error('Invalid claim data');
  }

  const connection = new Connection('https://api.devnet.solana.com');
  
  await burnToken(connection, userWallet, mint, tokenAmount);

  console.log('Burned tokens successfully');
  await updateDoc(doc(db, 'claims', claimId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });

  console.log('Claim status updated to completed');
};


export const cancelRewardClaim = async (claimId: string): Promise<void> => {
  console.log('Starting cancelRewardClaim function with claimId:', claimId);

  const claimDoc = await getDoc(doc(db, 'claims', claimId));
  if (!claimDoc.exists()) {
    console.error('Claim does not exist');
    throw new Error('Claim does not exist');
  }

  const claimData = claimDoc.data();
  if (claimData!.status !== 'pending') {
    console.error('Claim is not pending');
    throw new Error('Claim is not pending');
  }

  console.log('Deleting claim document');
  await deleteDoc(doc(db, 'claims', claimId));

 
  const rewardDoc = await getDoc(doc(db, 'rewards', claimData.rewardId));
  if (rewardDoc.exists()) {
    const rewardData = rewardDoc.data();
    await updateDoc(doc(db, 'rewards', claimData.rewardId), {
      quantity: rewardData!.quantity + 1
    });

    console.log('Reward quantity incremented');
  }

  console.log('Claim cancelled');
};


export const getClaimsByUser = async (userId: string): Promise<any[]> => {
  const claimsQuery = query(collection(db, 'claims'), where('userId', '==', userId));
  const querySnapshot = await getDocs(claimsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const getClaimsByOwner = async (ownerId: string): Promise<any[]> => {
  const rewardsQuery = query(collection(db, 'rewards'), where('ownerId', '==', ownerId));
  const rewardsSnapshot = await getDocs(rewardsQuery);
  const rewardIds = rewardsSnapshot.docs.map(doc => doc.id);

  if (rewardIds.length === 0) {
    return [];
  }

  const claimsQuery = query(collection(db, 'claims'), where('rewardId', 'in', rewardIds));
  const claimsSnapshot = await getDocs(claimsQuery);
  return claimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const getClaimData = async (claimId: string): Promise<any> => {
  const claimDoc = await getDoc(doc(db, 'claims', claimId));
  if (!claimDoc.exists()) {
    throw new Error('Claim does not exist');
  }

  return claimDoc.data();
};


export const getPointsConfiguration = async (userId: string): Promise<number> => {
  const docRef = doc(db, 'pointsConfiguration', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Points configuration not found');
  }

  const data = docSnap.data();
  return data.pointsValue;
};
