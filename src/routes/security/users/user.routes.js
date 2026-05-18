const { Router } = require("express");
const router = Router();

const userController = require("../../../controllers/parameters/security/user.controller");

// LOGIN
router.post("/login", userController.login);

module.exports = router;