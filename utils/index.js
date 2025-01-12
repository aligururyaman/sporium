exports.decrementCredits = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Europe/Istanbul")
  .onRun(async (context) => {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("credit", ">", 0).get();

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      const currentCredit = doc.data().credit;
      batch.update(doc.ref, {
        credit: Math.max(0, currentCredit - 1),
      });
    });

    await batch.commit();
  });
