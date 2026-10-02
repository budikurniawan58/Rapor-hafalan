import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { HafalanCategory, SchoolConfig, Student, UserAccount } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SCHOOL_CONFIG,
  DEFAULT_STUDENTS,
} from '../constants/defaultData';
import { DEFAULT_USERS } from '../constants/defaultUsers';

const STUDENTS_COLLECTION = 'students';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'settings';
const USERS_COLLECTION = 'users';
const CONFIG_DOC_ID = 'schoolConfig';

/**
 * Initializes Firestore data with default data if empty.
 */
export async function initializeFirestoreIfEmpty(): Promise<void> {
  try {
    // Check if students exist
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    if (studentsSnap.empty) {
      console.log('Seeding initial students to Firestore...');
      const batch = writeBatch(db);
      for (const student of DEFAULT_STUDENTS) {
        const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
        batch.set(studentRef, student);
      }
      await batch.commit();
    }

    // Check if categories exist
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (categoriesSnap.empty) {
      console.log('Seeding initial categories to Firestore...');
      const batch = writeBatch(db);
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const cat = DEFAULT_CATEGORIES[i];
        const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(catRef, { ...cat, order: i });
      }
      await batch.commit();
    }

    // Check if schoolConfig exists
    const configRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      console.log('Seeding initial school config to Firestore...');
      await setDoc(configRef, DEFAULT_SCHOOL_CONFIG);
    }

    // Check if users exist
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      for (const u of DEFAULT_USERS) {
        const uRef = doc(db, USERS_COLLECTION, u.id);
        batch.set(uRef, u);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'initial_seed');
  }
}

/**
 * Subscribes to real-time changes in students collection across all devices.
 */
export function subscribeToStudents(
  onData: (students: Student[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, STUDENTS_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_STUDENTS);
        return;
      }
      const list: Student[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Student;
        list.push({ ...data, id: d.id });
      });
      // Sort students by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    (err) => {
      console.warn('Firestore students subscription error:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, STUDENTS_COLLECTION);
    }
  );
}

/**
 * Subscribes to real-time changes in categories collection across all devices.
 */
export function subscribeToCategories(
  onData: (categories: HafalanCategory[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, CATEGORIES_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_CATEGORIES);
        return;
      }
      const list: Array<HafalanCategory & { order?: number }> = [];
      snapshot.forEach((d) => {
        const data = d.data() as HafalanCategory & { order?: number };
        list.push({ ...data, id: d.id });
      });
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(list);
    },
    (err) => {
      console.warn('Firestore categories subscription error:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, CATEGORIES_COLLECTION);
    }
  );
}

/**
 * Subscribes to real-time changes in school config across all devices.
 */
export function subscribeToSchoolConfig(
  onData: (config: SchoolConfig) => void,
  onError?: (err: unknown) => void
): () => void {
  const configRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SchoolConfig);
      } else {
        onData(DEFAULT_SCHOOL_CONFIG);
      }
    },
    (err) => {
      console.warn('Firestore config subscription error:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, `${SETTINGS_COLLECTION}/${CONFIG_DOC_ID}`);
    }
  );
}

/**
 * Saves or updates a single student to Firestore.
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
    await setDoc(studentRef, {
      ...student,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLLECTION}/${student.id}`);
  }
}

/**
 * Batch saves multiple students (e.g. after Excel import).
 */
export async function saveMultipleStudentsToFirestore(students: Student[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const student of students) {
      const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
      batch.set(studentRef, {
        ...student,
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COLLECTION);
  }
}

/**
 * Deletes a student from Firestore.
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STUDENTS_COLLECTION}/${studentId}`);
  }
}

/**
 * Saves all categories to Firestore.
 */
export async function saveCategoriesToFirestore(categories: HafalanCategory[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
      batch.set(catRef, { ...cat, order: i });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CATEGORIES_COLLECTION);
  }
}

/**
 * Saves school configuration to Firestore.
 */
export async function saveSchoolConfigToFirestore(config: SchoolConfig): Promise<void> {
  try {
    const configRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    await setDoc(configRef, config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${CONFIG_DOC_ID}`);
  }
}

/**
 * Subscribes to real-time changes in users collection.
 */
export function subscribeToUsers(
  onData: (users: UserAccount[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_USERS);
        return;
      }
      const list: UserAccount[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as UserAccount), id: d.id });
      });
      list.sort((a, b) => a.username.localeCompare(b.username));
      onData(list);
    },
    (err) => {
      console.warn('Firestore users subscription error:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
    }
  );
}

/**
 * Saves or updates a user account to Firestore.
 */
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${user.id}`);
  }
}

/**
 * Deletes a user account from Firestore.
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
  }
}

