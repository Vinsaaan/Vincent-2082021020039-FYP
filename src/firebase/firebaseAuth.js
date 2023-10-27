import firebase from "./firebase";

export const createUser = async (formData) => {
  try {
    const { user } = await firebase
      .auth()
      .createUserWithEmailAndPassword(formData.email, formData.password);
    await user.updateProfile({
      displayName: `${formData.firstName} ${formData.lastName}`,
    });

    await firebase.firestore().collection("users").doc(user.uid).set({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      userName: formData.userName,
      gender: formData.gender,
      userType: formData.userType,
      phoneNumber: formData.phoneNumber,
      uid: user.uid,
    });

    return user;
  } catch (error) {
    throw error;
  }
};
