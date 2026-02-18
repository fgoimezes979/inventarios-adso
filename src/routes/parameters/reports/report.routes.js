const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware");

const { getInventoryReport } = require("../../../controllers/reports/inventoryReport.controller");
const { exportInventoryExcel } = require("../../../controllers/reports/inventoryReportExcel.controller");
const { exportJournalExcel } = require("../../../controllers/reports/journalReport.controller");

/** proteger todas las rutas */
router.use(authMiddleware);

// JSON
router.get("/inventory", getInventoryReport);

// EXCEL
router.get("/inventory-excel", exportInventoryExcel);

router.get("/journal-excel", exportJournalExcel);

module.exports = router;
