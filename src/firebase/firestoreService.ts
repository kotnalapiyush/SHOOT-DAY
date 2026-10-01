import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { PhotographerProfile } from '../types';

export interface SecurityRuleContext {
  userId?: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  resourcePath: string;
  authEmail?: string;
}

export function handleFirestoreError(
  error: unknown,
  context: SecurityRuleContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes('permission-denied') ||
    message.includes('Missing or insufficient permissions')
  ) {
    const errorPayload = {
      error: 'PERMISSION_DENIED',
      message: 'Firestore request was denied by security rules.',
      operation: context.operation,
      resourcePath: context.resourcePath,
      userId: context.userId || 'anonymous',
      authEmail: context.authEmail || 'none',
      timestamp: new Date().toISOString(),
    };
    console.error('Firestore Security Rule Violation:', JSON.stringify(errorPayload, null, 2));
  } else {
    console.warn(`Firestore operation failed (${context.operation} ${context.resourcePath}):`, message);
  }
}

/**
 * Save or update a photographer profile in Firestore
 */
export async function syncPhotographerToFirestore(profile: PhotographerProfile): Promise<void> {
  try {
    const docRef = doc(db, 'photographers', profile.id);
    await setDoc(docRef, { ...profile }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, {
      operation: 'write',
      resourcePath: `/photographers/${profile.id}`,
    });
  }
}

/**
 * Delete a photographer profile from Firestore
 */
export async function deletePhotographerFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'photographers', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, {
      operation: 'delete',
      resourcePath: `/photographers/${id}`,
    });
  }
}

/**
 * Sync multiple photographers to Firestore
 */
export async function syncAllPhotographersToFirestore(profiles: PhotographerProfile[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    profiles.forEach((profile) => {
      const ref = doc(db, 'photographers', profile.id);
      batch.set(ref, profile, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, {
      operation: 'write',
      resourcePath: '/photographers',
    });
  }
}

/**
 * Load photographers from Firestore if available
 */
export async function fetchPhotographersFromFirestore(): Promise<PhotographerProfile[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, 'photographers'));
    if (!querySnapshot.empty) {
      const list: PhotographerProfile[] = [];
      querySnapshot.forEach((d) => {
        list.push(d.data() as PhotographerProfile);
      });
      return list;
    }
  } catch (error) {
    handleFirestoreError(error, {
      operation: 'list',
      resourcePath: '/photographers',
    });
  }
  return null;
}
