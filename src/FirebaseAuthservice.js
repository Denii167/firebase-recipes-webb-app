import { auth } from "./FirebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const logoutUser = () => {
  return signOut(auth);
};

const sendPasswordResetEmail = (email) => {
  return firebaseSendPasswordResetEmail(auth, email);
};

const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();

  return signInWithPopup(auth, provider);
};

const subscribeToAuthChanges = (handleAuthChange) => {
  onAuthStateChanged(auth, (user) => {
    handleAuthChange(user);
  });
};

const FirebaseAuthService = {
  registerUser,
  loginUser,
  logoutUser,
  sendPasswordResetEmail,
  loginWithGoogle,
  subscribeToAuthChanges,
};

export default FirebaseAuthService;
