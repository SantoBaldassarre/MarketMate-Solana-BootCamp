import { doc, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 

interface Metadata {
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
  ownerId: string;
}

export const saveMetadataToFirebase = async (metadata: Metadata, user: any) => {
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!metadata) {
    throw new Error('Metadata is undefined');
  }

  try {
    const metadataDoc = doc(db, 'tokenMetadata', metadata.mintAccount); 
    await setDoc(metadataDoc, {
      ...metadata,
      ownerId: user.uid 
    });

    console.log('Metadata saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving metadata to Firestore:', error);
    throw error;
  }
};
