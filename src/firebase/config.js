import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyAR0LDS0L2k-NMbgzf9gHB8X4XewNvI7nE",
    authDomain: "loyal-app-28927.firebaseapp.com",
    projectId: "loyal-app-28927",
    storageBucket: "loyal-app-28927.appspot.com",
    messagingSenderId: "950460693315",
    appId: "1:950460693315:web:993d4ac1c3bbea3e6b4df6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);