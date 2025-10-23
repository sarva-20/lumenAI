"use client";
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  type Firestore,
  type DocumentData,
  type Query,
} from 'firebase/firestore';

export function useCollection<T>(
  firestore: Firestore | null,
  collectionName: string,
  ...queryConstraints: any[]
): { data: T[] | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, collectionName), ...queryConstraints.filter(c => c));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(documents);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}
