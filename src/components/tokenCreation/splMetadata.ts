import { Connection, Keypair, PublicKey as SolanaPublicKey } from '@solana/web3.js';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3, CreateMetadataAccountV3InstructionArgs, CreateMetadataAccountV3InstructionAccounts, DataV2Args, MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey as umiPublicKey, createSignerFromKeypair, signerIdentity, Pda } from "@metaplex-foundation/umi";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import { uploadMetadataToPinata } from '../../utils/uploadMetadataToPinata';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Metadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: { address: string; verified: boolean; share: number }[];
}

export const createMetadata = async (
  connection: Connection,
  wallet: Keypair,
  mint: SolanaPublicKey,
  userTokenAccountAddress: SolanaPublicKey,
  name: string,
  symbol: string,
  description: string,
  imageUrl: string,
  sellerFee: number,
  creators: { address: string; verified: boolean; share: number }[],
  user: { uid: string } // aggiunto parametro utente
) => {
  console.log('Uploading metadata to Pinata...');
  const metadataUri = await uploadMetadataToPinata({
    name,
    symbol,
    description,
    image: imageUrl,
    seller_fee_basis_points: sellerFee,
    creators,
  });

  console.log('Metadata URI:', metadataUri);

  const umi = createUmi("https://api.devnet.solana.com", "finalized");
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet.secretKey));
  const myKeypairSigner = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(myKeypairSigner));

  const seeds = [
    string({ size: "variable" }).serialize("metadata"),
    publicKeySerializer().serialize(MPL_TOKEN_METADATA_PROGRAM_ID),
    publicKeySerializer().serialize(umiPublicKey(mint.toBase58())),
  ];
  const metadata: Pda = umi.eddsa.findPda(MPL_TOKEN_METADATA_PROGRAM_ID, seeds);

  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: metadata,
    mint: umiPublicKey(mint.toBase58()), // Convert SolanaPublicKey to umiPublicKey
    mintAuthority: myKeypairSigner,
    payer: myKeypairSigner,
    updateAuthority: myKeypairSigner,
  };

  const data: DataV2Args = {
    name: name,
    symbol: symbol,
    uri: metadataUri,
    sellerFeeBasisPoints: sellerFee,
    creators: creators.map(creator => ({
      address: umiPublicKey(creator.address), // Convert string to umiPublicKey
      verified: creator.verified,
      share: creator.share,
    })),
    collection: null,
    uses: null,
  };

  const args: CreateMetadataAccountV3InstructionArgs = {
    data: data,
    isMutable: true,
    collectionDetails: null,
  };

  console.log('Creating metadata account with the following details:');
  console.log('Accounts:', accounts);
  console.log('Args:', args);

  const tx = createMetadataAccountV3(
    umi,
    {
      ...accounts,
      ...args,
    }
  );

  try {
    const result = await tx.sendAndConfirm(umi);
    console.log(`Successfully Minted!. Transaction Here: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);

    // Salvare i metadati su Firebase
    const metadataToSave = {
      mintAccount: mint.toBase58(),
      tokenAta: userTokenAccountAddress.toBase58(),
      name,
      symbol,
      description,
      imageUrl,
      sellerFee,
      creators,
      metadataUri,
      transactionId: result.signature.toString(),  // Converti il Uint8Array in una stringa o array di numeri
      ownerId: user.uid, // Assicurati che l'ownerId sia incluso e usi l'utente autenticato
    };

    console.log('Saving metadata to Firestore with the following details:');
    console.log(metadataToSave);

    const tokenMetadataCollection = collection(db, 'tokenMetadata'); // Usa collection con db
    await addDoc(tokenMetadataCollection, metadataToSave); // Usa addDoc per aggiungere documenti

    console.log('Metadata saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving metadata to Firestore:', error);
    throw error;
  }
};
