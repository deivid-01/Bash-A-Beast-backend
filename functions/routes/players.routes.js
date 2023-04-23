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
    const playersRef = db.collection("players");
    const snapshot = await playersRef.orderBy("score", "desc").get();
    const players = snapshot.docs.map((doc) => doc.data());

    if (players.length < 5) {
      await playersRef.add({name: req.body.name, score: req.body.score});
    } else {
      const minScore = players[players.length - 1].score;

      if (req.body.score > minScore) {
        const playerToRemove = snapshot.docs
            .find((doc) => doc.data().score === minScore);
        await playerToRemove.ref.delete();
        await playersRef.add({name: req.body.name, score: req.body.score});
      }
    }

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

router.post("/api/highscorevalidation", async (req, res) => {
  try {
    const newScore = req.body.score;
    const playersRef = db.collection("players");

    const snapshot = await playersRef.get();
    const numPlayers = snapshot.size;

    if (numPlayers === 0) {
      return res.status(200).json({status: true, rank: 1});
    } else if (numPlayers < 5) {
      const playerScores = snapshot.docs.map((doc) => doc.data().score);
      const rank = playerScores.filter((score) => score > newScore).length + 1;
      return res.status(200).json({status: true, rank});
    }

    const minScoreSnapshot = await playersRef.orderBy("score", "asc")
        .limit(1).get();
    const minScore = minScoreSnapshot.docs[0].data().score;

    if (newScore > minScore) {
      const snapshot = await playersRef.where("score", ">=", newScore).get();
      const numPlayersAbove = snapshot.size;
      const rank = numPlayersAbove + 1;
      return res.status(200).json({status: true, rank});
    } else {
      return res.status(200).json({status: false, rank: -1});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

module.exports = router;
