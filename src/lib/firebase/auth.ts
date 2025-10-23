import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

type UserRole = "homeowner" | "installer";

interface AdditionalSignupData {
  fullName: string;
  role: UserRole;
}

interface InstallerProfileData {
    serviceLocations?: string;
    companyName?: string;
    companyDescription?: string;
    pricingDetails?: string;
}

const { auth, firestore } = initializeFirebase();
const googleProvider = new GoogleAuthProvider();

// Function to create or update user in Firestore
const updateUserProfile = async (user: UserCredential["user"], additionalData?: Partial<AdditionalSignupData & InstallerProfileData>) => {
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // New user, create the document
    const { displayName, email, photoURL } = user;
    const data = {
      displayName: additionalData?.fullName || displayName,
      email,
      photoURL,
      createdAt: serverTimestamp(),
      role: additionalData?.role || 'homeowner', // Default role
    };
    await setDoc(userRef, data);
  }
  // If user exists, you could merge new data if needed, but for now we only create on signup.
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, additionalData: AdditionalSignupData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateUserProfile(userCredential.user, { ...additionalData, fullName: additionalData.fullName });
  return userCredential;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in/up with Google
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // This will create a profile if one doesn't exist. Role defaults to homeowner.
  await updateUserProfile(userCredential.user);
  return userCredential;
};

// Sign out
export const signOut = async () => {
  return firebaseSignOut(auth);
};
