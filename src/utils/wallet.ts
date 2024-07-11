import { Keypair, PublicKey } from '@solana/web3.js';
import { db, doc, getDoc } from '../firebase';
import CryptoJS from 'crypto-js';

export const fetchKeypair = async (user: any): Promise<Keypair> => {
  if (user) {
    const docRef = doc(db, 'wallets', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const encryptedKey = docSnap.data().secretKey;
      const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, user.uid).toString(CryptoJS.enc.Utf8);
      try {
        const secretKeyArray = Uint8Array.from(JSON.parse(decryptedKey));
        return Keypair.fromSecretKey(secretKeyArray);
      } catch (error) {
        console.error('Error parsing decrypted key:', error);
        throw new Error('Decryption failed. Invalid key.');
      }
    }
  }

  throw new Error('User not authenticated or wallet not found');
};

export const getPublicKey = async (user: any): Promise<PublicKey> => {
  const keypair = await fetchKeypair(user);
  return keypair.publicKey;
};
