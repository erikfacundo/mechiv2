import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  projectId: 'mechifyv2',
  // En producción, agrega aquí tu configuración de Firebase Client SDK
  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

export const db = getFirestore()

