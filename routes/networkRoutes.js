const express = require("express");
const router = express.Router();
const controller = require("../controllers/networkController");

router.get("/Network/:id", controller.getNetwork);
router.post("/Network", controller.saveNetwork);

module.exports = router;
