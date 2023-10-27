const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.updateUserInfo = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (JSON.stringify(newValue) === JSON.stringify(previousValue)) {
      console.log("User info has not changed");
      return null;
    }

    const db = admin.firestore();
    const userId = context.params.userId;
    const batch = db.batch();

    const updateFieldIfChanged = async (
      collection,
      fields,
      conditionField,
      conditionValue
    ) => {
      const ref = db
        .collection(collection)
        .where(conditionField, "==", conditionValue);
      const snapshot = await ref.get();

      snapshot.docs.forEach((doc) => {
        const updates = {};
        fields.forEach((field) => {
          if (newValue[field] !== previousValue[field]) {
            updates[field] = newValue[field];
          }
        });
        if (Object.keys(updates).length > 0) {
          batch.update(doc.ref, updates);
        }
      });
    };

    // Update student answers
    await updateFieldIfChanged(
      "studentAnswers",
      ["firstName", "lastName"],
      "userId",
      userId
    );

    // Update quizzes if the user is a lecturer
    if (newValue.userType === "lecturer") {
      await updateFieldIfChanged(
        "quizzes",
        ["lecturerFirstName", "lecturerLastName"],
        "uid",
        userId
      );
    }

    await batch.commit();
    console.log("User info updated in all documents");
    return null;
  });
