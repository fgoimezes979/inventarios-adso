const express = require("express");
const router = express.Router();
const journalController = require("../../controllers/accounting/journal.controller");
const { getBalanceSheet } = require("../../controllers/accounting/balance.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/report", journalController.report);
router.get("/trial-balance", journalController.trialBalance);
router.get("/income-statement", journalController.getIncomeStatement); // ✅ CORREGIDO
router.get("/balance-sheet", getBalanceSheet);

router.get("/", journalController.index);
router.get("/:id", journalController.show);
router.post("/", journalController.create);
router.put("/:id", journalController.update);
router.delete("/:id", journalController.destroy);

module.exports = router;