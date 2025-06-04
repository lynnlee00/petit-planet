// utils/firebase.ts

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAthVyMWUJm62AENokDtA9ASLJ2Pa5g7LM",
  authDomain: "parent-kids-activities.firebaseapp.com",
  databaseURL: "https://parent-kids-activities-default-rtdb.firebaseio.com",
  projectId: "parent-kids-activities",
  storageBucket: "parent-kids-activities.appspot.com",
  messagingSenderId: "825321421988",
  appId: "1:825321421988:web:5342ee333655e28d1e7a31",
  measurementId: "G-0BKTVYLJER",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { app, db };
