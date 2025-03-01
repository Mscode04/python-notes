// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPlZE4Nf9tCs04P-WiFCvZemSxJ0ivBms",
  authDomain: "home-c8829.firebaseapp.com",
  projectId: "home-c8829",
  storageBucket: "home-c8829.firebasestorage.app",
  messagingSenderId: "1009118507257",
  appId: "1:1009118507257:web:86466c474988e9c3dfb228",
  measurementId: "G-JC7MGP56DM"
};


const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
