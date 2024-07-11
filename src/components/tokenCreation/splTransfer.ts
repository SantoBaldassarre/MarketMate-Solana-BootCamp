// src/utils/splTransfer.ts
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';

export const transferToken = async (
  connection: Connection,
  wallet: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  amount: number,
  decimals: number
): Promise<string> => {
  try {
    // Calcola l'importo corretto in base ai decimali
    const amountInLamports = amount * Math.pow(10, decimals);

    // Creare o ottenere l'account associato al token del destinatario
    const ataSender = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      wallet.publicKey
    );

    const ataReceiver = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mint,
      destination
    );

    // Trasferire i token
    const transferInstruction = createTransferInstruction(
      ataSender.address,
      ataReceiver.address,
      wallet.publicKey,
      amountInLamports
    );

    // Creare e inviare la transazione
    const transaction = new Transaction().add(transferInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    return signature;
  } catch (error) {
    console.error('Error transferring token:', error);
    throw error;
  }
};
