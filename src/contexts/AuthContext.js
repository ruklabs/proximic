import { useEffect, useState, useContext, createContext } from 'react';

import { auth } from '../firebase';

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut, 
  signInWithEmailAndPassword
} from 'firebase/auth';

import { writeUserData } from '../endpoints';


export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  async function signIn(email, pass) {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      console.log('Signed in');
    } catch (err) {
      console.log("Sign in failed: ", err);
    }
  }

  async function signUp(email, username, pass) {
    console.log('signing up', email, username, pass);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);

      // update user credentials on database
      const user = auth.currentUser;
      writeUserData(user.uid, username, user.email);

      sendEmailVerification(user);
      console.log('Email verification sent');
    } catch (err) {
      console.log('Sign up failed:', err);
    }
  }

  async function signOff() {
    try {
      await signOut(auth);
      console.log('Signed out');
    } catch (err) {
      console.log('Sign out failed:', err);
    }
  }

  useEffect(() => {
    // on mount

    // check for when the state of authorization changed
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // on dismount
    return unsubscribe;
  }, []);


  return (
    <AuthContext.Provider value={{currentUser, signOff, signUp, signIn}}>
      { children }
    </AuthContext.Provider>
  );
}
