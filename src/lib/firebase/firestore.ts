import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

// Example function to get a user profile
export const getUserProfile = async (userId: string) => {
  const userRef = doc(firestore, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};
