// src/components/tokenCreation/splMint.ts
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { mintTo, getOrCreateAssociatedTokenAccount, createMintToInstruction } from '@solana/spl-token';

export const mintToken = async (
  connection: Connection,
  wallet: Keypair,
  mint: PublicKey,
  amount: number,
  tokenAccount: PublicKey,
  decimals: number
): Promise<string> => {
  try {
    // Calcola l'importo corretto in base ai decimali
    const amountInLamports = amount * Math.pow(10, decimals);

    // Creare o ottenere l'account associato al token
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    // Crea l'istruzione per mintare i token
    const mintToInstruction = createMintToInstruction(
      mint,
      ata.address,
      wallet.publicKey,
      amountInLamports
    );

    // Creare e inviare la transazione
    const transaction = new Transaction().add(mintToInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    return signature;
  } catch (error) {
    console.error('Error minting token:', error);
    throw error;
  }
};
