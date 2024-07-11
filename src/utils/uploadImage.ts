// src/components/tokenCreation/utils/uploadImage.ts
import axios from 'axios';

export async function uploadImage(file: File): Promise<string> {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(url, formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': 'ecd85e82737a589c9f9b',
        'pinata_secret_api_key': '780bb379526f298fea100952b2159e8238a06e67e580f3de0cf5a199cb5fd3e8',
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to Pinata:', error);
    throw new Error('Failed to upload image to Pinata');
  }
}
