import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface UserType {
  id: string;
  email: string;
  publicKey: string;
}

export const getUsersByEmail = async (email: string): Promise<UserType[]> => {
  const usersQuery = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(usersQuery);
  
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      publicKey: data.publicKey
    } as UserType;
  });
};
