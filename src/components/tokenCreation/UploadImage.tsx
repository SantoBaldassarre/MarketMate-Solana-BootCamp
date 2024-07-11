// src/components/tokenCreation/UploadImage.tsx
import React, { useState } from 'react';
import { uploadImage } from '../../utils/uploadImage';  // Assicurati che il percorso sia corretto

interface UploadImageProps {
  onImageUploaded: (imageUrl: string) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ onImageUploaded }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (file) {
      const imageUrl = await uploadImage(file);
      onImageUploaded(imageUrl);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
};

export default UploadImage;
