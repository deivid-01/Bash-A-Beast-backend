const express = require("express");
const router = new express.Router(); // eslint-disable-line no-console


const admin = require("firebase-admin");

const db = admin.firestore();
router.get("/api/players", async (req, res)=>{
  try {
    const query = db.collection("players");
    const querySnapShot=await query.get();
    const docs = querySnapShot.docs;

    const response=docs.map((doc) =>({
      name: doc.data().name,
      score: doc.data().score,
    }));

    response.sort((a, b) => b.score - a.score);

    return res.status(200).json({players: response});
  } catch ( error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.post("/api/players", async (req, res)=>{
  try {
    await db.collection("players")
        .doc()
        .create({name: req.body.name, score: req.body.score} );

    return res.status(204).json({status: "Success"});
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.delete("/api/players", async (req, res) => {
  try {
    await db.collection("players").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
    return res.status(204).json({status: "Success"});
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

module.exports = router;
