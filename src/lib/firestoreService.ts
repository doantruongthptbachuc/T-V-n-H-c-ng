import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  collection, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  SchoolConfig, 
  Question, 
  Story, 
  YouthRegistration, 
  VolunteerMember, 
  VolunteerAttendance, 
  Activity, 
  QAInfographic, 
  Counselor,
  AIPromptQuestion,
  AIChatLog,
  ContactMessage
} from '../types';
import {
  initialConfig,
  initialQuestions,
  initialStories,
  initialYouthRegistrations,
  initialVolunteerMembers,
  initialVolunteerAttendance,
  initialActivities,
  initialInfographics,
  initialCounselors,
  initialAIPromptQuestions,
  initialAIChatLogs
} from '../data/initialData';

function cleanForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(item => cleanForFirestore(item)) as any;
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) cleaned[key] = cleanForFirestore(value);
  }
  return cleaned as T;
}

const SETTINGS_COLLECTION = 'settings';
const CONFIG_DOC = 'schoolConfig';
const COUNSELORS_DOC = 'counselors';
const AI_PROMPTS_DOC = 'aiPrompts';

export async function getFirebaseSchoolConfig(): Promise<SchoolConfig> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const { adminUsername: _u, adminPassword: _p, ...safeData } = data as any;
      return { ...initialConfig, ...safeData, adminUsername: initialConfig.adminUsername, adminPassword: initialConfig.adminPassword };
    } else {
      const { adminUsername: _u, adminPassword: _p, ...safeInitial } = initialConfig as any;
      await setDoc(docRef, cleanForFirestore(safeInitial));
      return initialConfig;
    }
  } catch (err) {
    console.warn('Lỗi getFirebaseSchoolConfig:', err);
    return initialConfig;
  }
}

export async function saveFirebaseSchoolConfig(config: SchoolConfig): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC);
    const { adminUsername: _u, adminPassword: _p, ...safeConfig } = config as any;
    await setDoc(docRef, cleanForFirestore(safeConfig), { merge: true });
  } catch (err) {
    console.error('Lỗi saveFirebaseSchoolConfig:', err);
    throw err;
  }
}

export async function getFirebaseCounselors(): Promise<Counselor[]> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COUNSELORS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.items) && snap.data().items.length > 0) return snap.data().items as Counselor[];
    return initialCounselors;
  } catch (err) {
    console.warn('Lỗi getFirebaseCounselors:', err);
    return initialCounselors;
  }
}

export async function saveFirebaseCounselors(counselors: Counselor[]): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COUNSELORS_DOC);
    await setDoc(docRef, cleanForFirestore({ items: counselors }), { merge: true });
  } catch (err) {
    console.warn('Lỗi saveFirebaseCounselors:', err);
  }
}

export async function getFirebaseCollection<T extends { id: string }>(collectionName: string, initialDefault: T[]): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: T[] = [];
      snap.forEach(docSnap => items.push({ id: docSnap.id, ...(docSnap.data() as any) } as T));
      return items;
    }
    if (initialDefault && initialDefault.length > 0) await seedCollection(collectionName, initialDefault);
    return initialDefault;
  } catch (err) {
    console.warn(`Lỗi getFirebaseCollection (${collectionName}):`, err);
    return initialDefault;
  }
}

export async function saveFirebaseDoc<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, cleanForFirestore(item), { merge: true });
  } catch (err) {
    console.error(`Lỗi saveFirebaseDoc (${collectionName}/${item.id}):`, err);
    throw err;
  }
}

export async function deleteFirebaseDoc(collectionName: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Lỗi deleteFirebaseDoc (${collectionName}/${id}):`, err);
  }
}

// Firestore writeBatch has a 500-write limit. Chunk all bulk writes safely.
export async function saveFirebaseCollectionBatch<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
  try {
    const CHUNK_SIZE = 450;
    for (let start = 0; start < items.length; start += CHUNK_SIZE) {
      const chunk = items.slice(start, start + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, collectionName, item.id), cleanForFirestore(item), { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error(`Lỗi batch ghi ${collectionName}:`, err);
    throw err;
  }
}

async function seedCollection<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
  try {
    const CHUNK_SIZE = 450;
    for (let start = 0; start < items.length; start += CHUNK_SIZE) {
      const chunk = items.slice(start, start + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const it of chunk) batch.set(doc(db, collectionName, it.id), cleanForFirestore(it));
      await batch.commit();
    }
  } catch (err) {
    console.warn(`Seed collection ${collectionName} warning:`, err);
  }
}

export function subscribeToFirebaseConfig(callback: (config: SchoolConfig) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC);
  return onSnapshot(docRef, snap => {
    if (snap.exists()) callback({ ...initialConfig, ...(snap.data() as SchoolConfig) });
  }, err => console.warn('Lỗi realtime config snapshot:', err));
}

export function subscribeToFirebaseCounselors(callback: (counselors: Counselor[]) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, COUNSELORS_DOC);
  return onSnapshot(docRef, snap => {
    if (snap.exists() && Array.isArray(snap.data()?.items)) callback(snap.data().items as Counselor[]);
  }, err => console.warn('Lỗi realtime counselors snapshot:', err));
}

export function subscribeToFirebaseCollection<T extends { id: string }>(collectionName: string, callback: (items: T[]) => void): () => void {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, snap => {
    const list: T[] = [];
    snap.forEach(docSnap => list.push({ id: docSnap.id, ...(docSnap.data() as any) } as T));
    callback(list);
  }, err => console.warn(`Lỗi realtime ${collectionName} snapshot:`, err));
}