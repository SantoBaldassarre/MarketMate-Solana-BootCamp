// src/components/tokenCreation/utils/uploadMetadataToPinata.ts
import axios from 'axios';

const pinataApiKey = 'ecd85e82737a589c9f9b';
const pinataSecretApiKey = '780bb379526f298fea100952b2159e8238a06e67e580f3de0cf5a199cb5fd3e8';

export const uploadMetadataToPinata = async (metadata: any) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  try {
    const response = await axios.post(url, metadata, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error('Failed to upload metadata to Pinata');
  }
};
