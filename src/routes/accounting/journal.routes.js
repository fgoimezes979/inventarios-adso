const express = require("express");
const router = express.Router();
const journalController = require("../../controllers/accounting/journal.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", journalController.index);
router.get("/:id", journalController.show);
router.post("/", journalController.create);
router.put("/:id", journalController.update);
router.delete("/:id", journalController.destroy);

module.exports = router;
