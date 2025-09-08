
'use client';

import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'verdant-sentinel-8s9hn',
  appId: '1:1086986066444:web:4646beb412e2d06d3cec29',
  storageBucket: 'verdant-sentinel-8s9hn.firebasestorage.app',
  apiKey: 'AIzaSyCiSz8vo7XObZZcaSpPqpmBWbsGN73jAOI',
  authDomain: 'verdant-sentinel-8s9hn.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '1086986066444',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Function to update a user's avatar URL across all their posts
export const updateUserAvatarInFirestore = async (userId: string, newAvatarUrl: string) => {
    const q = query(collection(db, "disaster_updates"), where("user.uid", "==", userId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        const currentData = doc.data();
        batch.update(docRef, { user: { ...currentData.user, avatarUrl: newAvatarUrl } });
    });

    await batch.commit();
};


export {app, auth, db};
