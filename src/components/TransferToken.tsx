import React, { useState, FormEvent } from 'react';

const TransferToken = () => {
  const [mintAddress, setMintAddress] = useState('');
  const [fromAta, setFromAta] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const transferData = {
      mintAddress,
      fromAta,
      recipient,
      amount,
    };

    try {
      const response = await fetch("/api/transferToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Success! Transaction: ${result.transaction}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`);
      } else {
        setMessage('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-white">Transfer Token</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white">Mint Address</label>
          <input
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            className="mt-1 p-2 w-full rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block text-white">From Token Account</label>
          <input
            type="text"
            value={fromAta}
            onChange={(e) => setFromAta(e.target.value)}
            className="mt-1 p-2 w-full rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block text-white">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 p-2 w-full rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block text-white">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 p-2 w-full rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Transferring...' : 'Transfer Token'}
        </button>
      </form>
      {message && <p className="text-white mt-4">{message}</p>}
    </div>
  );
};

export default TransferToken;
