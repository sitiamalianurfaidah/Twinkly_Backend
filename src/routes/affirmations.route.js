const express = require("express");
const router = express.Router();
const affirmationController = require("../controllers/affirmations.controller");

router.post("/", affirmationController.createAffirmation); // POST /affirmations
router.get("/", affirmationController.getAllAffirmations); // GET /affirmations
router.get("/user/:user_id", affirmationController.getAffirmationsByUserId); // GET /affirmations/user/:user_id
router.delete("/:id", affirmationController.deleteAffirmation); // DELETE /affirmations/:id

module.exports = router;
