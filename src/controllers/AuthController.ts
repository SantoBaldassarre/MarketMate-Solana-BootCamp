import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const getUserRole = async (userId: string): Promise<string> => {  
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  throw new Error('User does not exist');
};

export const getBusinessOwnerFollowers = async (businessOwnerId: string): Promise<any[]> => {  
  const followersQuery = query(
    collection(db, 'users'),
    where('following', 'array-contains', businessOwnerId)
  );
  const querySnapshot = await getDocs(followersQuery);
  return querySnapshot.docs.map(doc => doc.data());
};

export const addPointsToUser = async (businessOwnerId: string, userId: string, points: number): Promise<void> => {  
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User does not exist');
  }
  const userData = userDoc.data();
  const updatedPoints = (userData.points || 0) + points;
  await setDoc(doc(db, 'users', userId), { points: updatedPoints }, { merge: true });
};

export const followBusinessOwner = async (userId: string, businessOwnerId: string): Promise<void> => {  
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User does not exist');
  }
  const userData = userDoc.data();
  const updatedFollowing = [...(userData.following || []), businessOwnerId];
  await setDoc(doc(db, 'users', userId), { following: updatedFollowing }, { merge: true });
};
