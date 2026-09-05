import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpMp6APHISNbWff3I-ZS8T_d9qiue93P4",
  authDomain: "behaviorchart-de09c.firebaseapp.com",
  projectId: "behaviorchart-de09c",
  storageBucket: "behaviorchart-de09c.firebasestorage.app",
  messagingSenderId: "378398235684",
  appId: "1:378398235684:web:8da2263a8f3ded11140cb1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
