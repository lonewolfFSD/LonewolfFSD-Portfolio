// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, signInAnonymously, linkWithCredential, browserLocalPersistence, GoogleAuthProvider, GithubAuthProvider, updateProfile, sendPasswordResetEmail, sendEmailVerification, fetchSignInMethodsForEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword, signOut, deleteUser, multiFactor, TotpMultiFactorGenerator } from "firebase/auth";
import { getRemoteConfig } from 'firebase/remote-config';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4J83iGH8x7qQLil5rXtBW0wowSWbVAJE",
  authDomain: "lonewolffsd-15f1f.firebaseapp.com",
  projectId: "lonewolffsd-15f1f",
  storageBucket: "lonewolffsd-15f1f.firebasestorage.app",
  messagingSenderId: "834465885635",
  appId: "1:834465885635:web:2fcee054ea4a2b80f8a176",
  measurementId: "G-QKL0BZ5B0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const remoteConfig = getRemoteConfig(app);
setPersistence(auth, browserLocalPersistence); // Ensure auth persists
const googleProvider = new GoogleAuthProvider();

const db = getFirestore(app);
const githubProvider = new GithubAuthProvider();

export { auth, db, remoteConfig, doc, storage, signInAnonymously, linkWithCredential, setDoc, getDoc, googleProvider, githubProvider, sendEmailVerification, updateProfile, sendPasswordResetEmail, fetchSignInMethodsForEmail, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updatePassword, multiFactor, TotpMultiFactorGenerator };