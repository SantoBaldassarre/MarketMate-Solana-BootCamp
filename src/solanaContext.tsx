import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

interface SolanaContextProps {
  connection: Connection | null;
  publicKey: string | null;
  setPublicKey: React.Dispatch<React.SetStateAction<string | null>>;
}

const SolanaContext = createContext<SolanaContextProps | undefined>(undefined);

export const useSolana = (): SolanaContextProps => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

interface SolanaProviderProps {
  children: ReactNode;
}

const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const conn = new Connection(clusterApiUrl('devnet'));
    setConnection(conn);
  }, []);

  return (
    <SolanaContext.Provider value={{ connection, publicKey, setPublicKey }}>
      {children}
    </SolanaContext.Provider>
  );
};

export default SolanaProvider;
