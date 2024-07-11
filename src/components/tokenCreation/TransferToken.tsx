import React, { useState } from 'react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { transferToken } from './splTransfer';

interface TransferTokenProps {
  connection: Connection;
  mint: PublicKey;
  wallet: Keypair;
  decimals: number;
}

const TransferToken: React.FC<TransferTokenProps> = ({ connection, mint, wallet, decimals }) => {
  const [amount, setAmount] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>('');
  const [transferring, setTransferring] = useState<boolean>(false);

  const handleTransfer = async () => {
    setTransferring(true);
    try {
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        setTransferring(false);
        return;
      }

      const recipientPublicKey = new PublicKey(recipient);
      const signature = await transferToken(connection, wallet, mint, recipientPublicKey, amount, decimals);
      alert(`Transferred ${amount} tokens successfully! Transaction Signature: ${signature}`);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      alert('Error transferring tokens. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount to transfer"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={handleTransfer} disabled={transferring}>
        {transferring ? 'Transferring...' : 'Transfer Tokens'}
      </button>
    </div>
  );
};

export default TransferToken;
