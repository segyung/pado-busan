import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig={apiKey:"AIzaSyCUzZQZZp2Wd543FVq7QhbWBNeCUBc9guQ",authDomain:"pado-53cc8.firebaseapp.com",projectId:"pado-53cc8",storageBucket:"pado-53cc8.firebasestorage.app",messagingSenderId:"206511089877",appId:"1:206511089877:web:b6a3f9e7a1daaa5e5d9a5c",measurementId:"G-K7YKJGQ7K2"};
export const app=initializeApp(firebaseConfig); export const db=getFirestore(app); export const storage=getStorage(app);
export { collection, doc, getDoc, setDoc, addDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion, ref, uploadBytes, getDownloadURL };
