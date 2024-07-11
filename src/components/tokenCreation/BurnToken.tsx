import React, { useState } from 'react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { burnToken } from './splBurn';

interface BurnTokenProps {
  connection: Connection;
  mint: PublicKey;
  tokenAccount: PublicKey;
  wallet: Keypair;
  decimals: number;
  onComplete: () => void;
}

const BurnToken: React.FC<BurnTokenProps> = ({ connection, mint, tokenAccount, wallet, decimals, onComplete }) => {
  const [amount, setAmount] = useState<number>(0);
  const [burning, setBurning] = useState<boolean>(false);

  const handleBurn = async () => {
    setBurning(true);
    try {
      const amountToBurn = amount * Math.pow(10, decimals); // Converti l'importo in lamport
      const signature = await burnToken(connection, wallet, mint, amountToBurn);
      alert(`Burned ${amount} tokens successfully! Transaction Signature: ${signature}`);
      onComplete();
    } catch (error) {
      console.error('Error burning tokens:', error);
      alert('Error burning tokens. Please try again.');
    } finally {
      setBurning(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Amount to burn"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={handleBurn} disabled={burning}>
        {burning ? 'Burning...' : 'Burn Tokens'}
      </button>
    </div>
  );
};

export default BurnToken;
