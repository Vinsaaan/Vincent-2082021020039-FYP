import { useState, useEffect } from "react";
import firebase from "./firebase";

const useUserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = firebase.auth().currentUser;

    if (user) {
      const db = firebase.firestore();
      const userRef = db.collection("users").doc(user.uid);

      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
          } else {
            console.error("No user found");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  return userData;
};

export default useUserData;
