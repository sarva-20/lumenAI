import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig } from "./config";
import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from "./auth/use-user";
import { useCollection } from "./firestore/use-collection";
import { useDoc } from "./firestore/use-doc";

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, firestore, auth };
}

export { 
    initializeFirebase, 
    FirebaseProvider, 
    FirebaseClientProvider,
    useFirebase,
    useFirebaseApp,
    useFirestore,
    useAuth,
    useUser,
    useCollection,
    useDoc
};
