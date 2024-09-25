import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: "AIzaSyDwMVmM076ggGAMuFs4mkwwpvcT39lAYtg",
  authDomain: "fir-recipes-f357b.firebaseapp.com",
  projectId: "fir-recipes-f357b",
  storageBucket: "fir-recipes-f357b.appspot.com",
  messagingSenderId: "972768041934",
  appId: "1:972768041934:web:dba059901bb5736de2699f",
  measurementId: "G-EN7PPTNFBN",
};

const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
