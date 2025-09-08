'use client';

import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export {app, auth, db};
