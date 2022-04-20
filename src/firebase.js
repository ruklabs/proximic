import { initializeApp } from 'firebase/app';

// for local testing and emulation
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

export const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
});


export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);


if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectDatabaseEmulator(database, 'localhost', 9000);
  connectStorageEmulator(storage, 'http://localhost:9199');
}
