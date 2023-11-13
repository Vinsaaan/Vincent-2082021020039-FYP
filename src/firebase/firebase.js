import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAk8C2FxTaPJONXzov0ktjSb_Qy8C0U2xs",
  authDomain: "bcs-final-year-project.firebaseapp.com",
  projectId: "bcs-final-year-project",
  storageBucket: "bcs-final-year-project.appspot.com",
  messagingSenderId: "597331548486",
  appId: "1:597331548486:web:dd514684361126b09ead47",
  measurementId: "G-P15ZYQVC91",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);

export default firebaseApp;
