"use client";

import { useEffect, useState } from "react";
import { FirebaseProvider, initializeFirebase } from ".";
import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

type FirebaseServices = {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    const services = initializeFirebase();
    setFirebase(services);
  }, []);

  if (!firebase) {
    // You can render a loading state here if needed
    return null;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
