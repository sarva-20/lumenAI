"use client";

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  firestore: null,
  auth: null,
});

export const FirebaseProvider = ({
  children,
  ...value
}: {
  children: React.ReactNode;
} & FirebaseContextValue) => {
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => useContext(FirebaseContext).app;

export const useFirestore = () => useContext(FirebaseContext).firestore;

export const useAuth = () => useContext(FirebaseContext).auth;
