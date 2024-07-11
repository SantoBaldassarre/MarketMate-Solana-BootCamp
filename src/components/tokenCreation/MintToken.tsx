// src/components/tokenCreation/MintToken.tsx
import React, { useState } from 'react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { mintToken } from './splMint';

interface MintTokenProps {
  connection: Connection;
  mint: PublicKey;
  wallet: Keypair;
  decimals: number; // Aggiungi i decimali
}

const MintToken: React.FC<MintTokenProps> = ({ connection, mint, wallet, decimals }) => {
  const [amount, setAmount] = useState<number>(0);
  const [minting, setMinting] = useState<boolean>(false);

  const handleMint = async () => {
    setMinting(true);
    try {
      const amountToMint = amount * Math.pow(10, decimals); // Converti l'importo in lamport
      const signature = await mintToken(connection, wallet, mint, amountToMint);
      alert(`Minted ${amount} tokens successfully! Transaction Signature: ${signature}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('Error minting tokens. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Amount to mint"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={handleMint} disabled={minting}>
        {minting ? 'Minting...' : 'Mint Tokens'}
      </button>
    </div>
  );
};

export default MintToken;
