// src/utils/tokenBurn.ts
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { burn, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

export const burnToken = async (
  connection: Connection,
  wallet: Keypair,
  mint: PublicKey,
  amount: number
): Promise<string> => {
  try {
    // Creare o ottenere l'account associato al token
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    // Burnare il token
    const signature = await burn(
      connection,
      wallet,
      ata.address,
      mint,
      wallet.publicKey,
      amount
    );

    // Confermare la transazione
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Error burning token:', error);
    throw error;
  }
};
