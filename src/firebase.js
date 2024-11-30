// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyCuPtzyna9DGXlmqZ03dRy1uujcnbmOpy4",
  authDomain: "cloud-quiz-app-dca39.firebaseapp.com",
  projectId: "cloud-quiz-app-dca39",
  storageBucket: "cloud-quiz-app-dca39.firebasestorage.app",
  messagingSenderId: "28227889552",
  appId: "1:28227889552:web:7a009da7852be6739c6b15"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
