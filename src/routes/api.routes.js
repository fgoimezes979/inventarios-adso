const { Router} = require("express");
const router = Router();
const productController = require ('../controllers/parameters/products/product.controller');



/**rutas para el controlador de brands */
const brandRouter = require("./parameters/brands/brand.routes");
router.use("/parameters/brand", brandRouter);


/**rutas para el controlador de products */
const productRouter = require("./parameters/products/product.routes"); 
router.use("/parameters/products", productRouter);


/**rutas para el controlador de usuarios */
const userRouter = require("./security/users/user.routes"); 
router.use("/security/users", userRouter); // 🔥 plural





/**rutas para el controlador de informes */
const clientRouter = require("./parameters/clients/client.routes"); 
router.use("/parameters/clients", clientRouter);





/**rutas para el controlador de proveedores */
const supplierRouter = require("./parameters/suppliers/supplier.routes");
router.use("/parameters/suppliers", supplierRouter);


/**rutas para el controlador de proveedores */
const locationRouter = require("./parameters/locations/location.routes");
router.use("/parameters/locations", locationRouter);


/**rutas para el controlador de entradas */
const entryRouter = require("./parameters/entries/entry.routes");
router.use("/parameters/entries", entryRouter);


/**rutas para el controlador de salidas */
const outRouter = require("./parameters/outs/out.routes");
router.use("/parameters/outs", outRouter);

/**rutas para el controlador de salidas */
const operationRouter = require("./parameters/operations/operation.routes");
router.use("/parameters/operations", operationRouter);

/**rutas para el controlador de salidas */
const txRouter = require("./parameters/txs/tx.routes");
router.use("/parameters/txs", txRouter);

/**rutas para el controlador de salidas */
const orderRouter = require("./parameters/orders/order.routes");
router.use("/parameters/orders", orderRouter);

// --- Controlador contable: journals ---
const journalRouter = require("./accounting/journal.routes");
router.use("/accounting/journals", journalRouter); // 🔹 Asegurarse del /api si Angular lo usa

/// --- RUTAS DE REPORTES ---
const reportsRouter = require("./parameters/reports/report.routes");
router.use("/parameters/reports", reportsRouter); // ✅ Correcto

/** rutas para el controlador de categorias */
const categoryRouter = require("./parameters/categories/category.routes");
router.use("/parameters/categories", categoryRouter);








/**exportar el modulo */
module.exports = router;
