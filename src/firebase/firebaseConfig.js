import { initializeApp }from"firebase/app";
import { getAuth }from"firebase/auth";
import { getFirestore }from"firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhXJAsFYrWh0sG3PvcIh8LoZnhMBMRTRw",
  authDomain: "blog-d7bcb.firebaseapp.com",
  projectId: "blog-d7bcb",
  storageBucket: "blog-d7bcb.firebasestorage.app",
  messagingSenderId: "955688564755",
  appId: "1:955688564755:web:085150653b3dc0b5efa7e6"
};

const app =initializeApp(firebaseConfig);

export const auth =getAuth(app);
export const db =getFirestore(app);

