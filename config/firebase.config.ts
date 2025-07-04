// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAT8VJPkK0othSOYhYUFEfd4mM3XbwFKw",
  authDomain: "nomzy-28166.firebaseapp.com",
  projectId: "nomzy-28166",
  storageBucket: "nomzy-28166.firebasestorage.app",
  messagingSenderId: "746287729245",
  appId: "1:746287729245:web:1e116041bfb79be4a01bb4",
  measurementId: "G-0QCP1Y6GN6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
