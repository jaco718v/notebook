import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

    apiKey: "AIzaSyA4SULttGJVoLt0gWSrJXvDdd1oKI-gTgo",
  
    authDomain: "notebook-88add.firebaseapp.com",
  
    projectId: "notebook-88add",
  
    storageBucket: "notebook-88add.appspot.com",
  
    messagingSenderId: "227185275601",
  
    appId: "1:227185275601:web:a14195cceb2ec269ef0bf0"
  
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app)