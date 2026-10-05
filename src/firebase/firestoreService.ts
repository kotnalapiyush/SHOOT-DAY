import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  PhotographerProfile,
  ShootBooking,
  NotificationItem,
  DayStatus,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
}

/**
 * Recursively clean data objects to remove any `undefined` values
 * which would trigger Firestore's "Unsupported field value: undefined" error.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Save or update a photographer profile in Firestore
 */
export async function syncPhotographerToFirestore(profile: PhotographerProfile): Promise<void> {
  const path = `photographers/${profile.id}`;
  try {
    const cleaned = cleanForFirestore({ ...profile });
    const docRef = doc(db, 'photographers', profile.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a photographer profile from Firestore
 */
export async function deletePhotographerFromFirestore(id: string): Promise<void> {
  const path = `photographers/${id}`;
  try {
    const docRef = doc(db, 'photographers', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch sync multiple photographers to Firestore
 */
export async function syncAllPhotographersToFirestore(profiles: PhotographerProfile[]): Promise<void> {
  const path = 'photographers';
  try {
    const batch = writeBatch(db);
    profiles.forEach((profile) => {
      const cleaned = cleanForFirestore({ ...profile });
      const ref = doc(db, 'photographers', profile.id);
      batch.set(ref, cleaned, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Direct fetch of all photographers from Firestore
 */
export async function fetchPhotographersFromFirestore(): Promise<PhotographerProfile[] | null> {
  const path = 'photographers';
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
    handleFirestoreError(error, OperationType.LIST, path);
  }
  return null;
}

/**
 * Fetch a single photographer document by ID from Firestore
 */
export async function fetchPhotographerByIdFromFirestore(id: string): Promise<PhotographerProfile | null> {
  const path = `photographers/${id}`;
  try {
    const docRef = doc(db, 'photographers', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PhotographerProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
}

/**
 * Real-time listener for Photographers collection
 */
export function subscribeToPhotographers(
  onUpdate: (photographers: PhotographerProfile[]) => void,
  fallbackInitialList: PhotographerProfile[]
): () => void {
  const path = 'photographers';
  const coll = collection(db, path);

  const unsubscribe = onSnapshot(
    coll,
    (snapshot) => {
      const remoteList: PhotographerProfile[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as PhotographerProfile;
        if (item && item.id && item.name) {
          remoteList.push(item);
        }
      });

      if (remoteList.length > 0) {
        onUpdate(remoteList);
      } else {
        // Initial boot on empty db: publish fallback and seed to Firestore once
        onUpdate(fallbackInitialList);
        fallbackInitialList.forEach((p) => {
          syncPhotographerToFirestore(p).catch(() => {});
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a shoot booking in Firestore
 */
export async function syncShootToFirestore(shoot: ShootBooking): Promise<void> {
  const path = `shoots/${shoot.id}`;
  try {
    const cleaned = cleanForFirestore({ ...shoot });
    const docRef = doc(db, 'shoots', shoot.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a shoot booking from Firestore
 */
export async function deleteShootFromFirestore(id: string): Promise<void> {
  const path = `shoots/${id}`;
  try {
    const docRef = doc(db, 'shoots', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time listener for Shoots collection
 */
export function subscribeToShoots(
  onUpdate: (shoots: ShootBooking[]) => void,
  fallbackInitialShoots: ShootBooking[]
): () => void {
  const path = 'shoots';
  const coll = collection(db, path);

  const unsubscribe = onSnapshot(
    coll,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: ShootBooking[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as ShootBooking;
          if (item && item.id) {
            list.push(item);
          }
        });
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        onUpdate(list);
      } else if (fallbackInitialShoots && fallbackInitialShoots.length > 0) {
        onUpdate(fallbackInitialShoots);
        fallbackInitialShoots.forEach((s) => {
          syncShootToFirestore(s).catch(() => {});
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Save or update availability dates for a photographer in Firestore
 */
export async function syncAvailabilityToFirestore(
  photographerId: string,
  dates: Record<string, DayStatus>
): Promise<void> {
  const path = `availability/${photographerId}`;
  try {
    const cleaned = cleanForFirestore({
      photographerId,
      dates,
      updatedAt: new Date().toISOString(),
    });
    const docRef = doc(db, 'availability', photographerId);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for Availability collection
 */
export function subscribeToAvailability(
  onUpdate: (avail: Record<string, Record<string, DayStatus>>) => void,
  fallbackAvailability: Record<string, Record<string, DayStatus>>
): () => void {
  const path = 'availability';
  const coll = collection(db, path);

  const unsubscribe = onSnapshot(
    coll,
    (snapshot) => {
      if (!snapshot.empty) {
        const map: Record<string, Record<string, DayStatus>> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.dates) {
            map[docSnap.id] = data.dates as Record<string, DayStatus>;
          }
        });

        // Merge any missing photographers from fallback
        Object.keys(fallbackAvailability).forEach((pid) => {
          if (!map[pid]) {
            map[pid] = fallbackAvailability[pid];
          }
        });

        onUpdate(map);
      } else if (fallbackAvailability && Object.keys(fallbackAvailability).length > 0) {
        onUpdate(fallbackAvailability);
        Object.entries(fallbackAvailability).forEach(([pid, dates]) => {
          syncAvailabilityToFirestore(pid, dates).catch(() => {});
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Save or update notification item in Firestore
 */
export async function syncNotificationToFirestore(notif: NotificationItem): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    const cleaned = cleanForFirestore({ ...notif });
    const docRef = doc(db, 'notifications', notif.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for Notifications collection
 */
export function subscribeToNotifications(
  onUpdate: (notifs: NotificationItem[]) => void,
  fallbackInitialNotifs: NotificationItem[]
): () => void {
  const path = 'notifications';
  const coll = collection(db, path);

  const unsubscribe = onSnapshot(
    coll,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as NotificationItem;
          if (item && item.id) {
            list.push(item);
          }
        });
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        onUpdate(list);
      } else if (fallbackInitialNotifs && fallbackInitialNotifs.length > 0) {
        onUpdate(fallbackInitialNotifs);
        fallbackInitialNotifs.forEach((n) => {
          syncNotificationToFirestore(n).catch(() => {});
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}
