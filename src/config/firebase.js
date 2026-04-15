import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBiM78RLE7k3c3JB3s2jbe-bZ8hnfNB3XA",
  authDomain: "interqwez.firebaseapp.com",
  databaseURL: "https://interqwez-default-rtdb.firebaseio.com",
  projectId: "interqwez",
  storageBucket: "interqwez.firebasestorage.app",
  messagingSenderId: "567621298904",
  appId: "1:567621298904:web:06bd5d9fbc52ee3b9745ad",
  measurementId: "G-NRYX70C82N"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
