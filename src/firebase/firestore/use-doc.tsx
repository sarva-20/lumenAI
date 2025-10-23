"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot, type Firestore, type DocumentData } from 'firebase/firestore';

export function useDoc<T>(
  firestore: Firestore | null,
  path: string,
  ...pathSegments: string[]
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    // Filter out any empty path segments
    const validPathSegments = pathSegments.filter(segment => segment);
    if (validPathSegments.length !== pathSegments.length) {
        // If there are invalid segments, we can't form a valid doc path.
        // We can either throw an error or just wait. Let's wait.
        setLoading(false);
        return;
    }
    
    const docRef = doc(firestore, path, ...validPathSegments);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, path, JSON.stringify(pathSegments)]);

  return { data, loading, error };
}
