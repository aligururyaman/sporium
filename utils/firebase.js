// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAg0XgJ8VSoYCpxEhMBDivOph-UlOeKfw0",
  authDomain: "spori-8e54d.firebaseapp.com",
  projectId: "spori-8e54d",
  storageBucket: "spori-8e54d.firebasestorage.com",
  messagingSenderId: "1002946165145",
  appId: "1:1002946165145:web:84b356a17cbfa938317b08",
  measurementId: "G-0P4D5QXVQ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
