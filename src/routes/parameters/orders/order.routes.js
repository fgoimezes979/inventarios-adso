const router = require("express").Router();
const authMiddleware = require("../../../middlewares/auth.middleware");

/** Importar los métodos del controlador de órdenes */
const { index, create, show, update, destroy } =
require("../../../controllers/parameters/orders/order.controller");

/** Importar la función getProductsByLocation */
const { getProductsByLocation } =
require("../../../controllers/parameters/products/product.controller");

/** 🔐 Proteger todas las rutas */
router.use(authMiddleware);

/** 🔹 Rutas principales */

// Obtener lista de órdenes
router.get("/", index);

// Crear nueva orden
router.post("/", create);

// Obtener productos por ubicación
router.get("/location/:location_id/products", getProductsByLocation);

// Operaciones sobre una orden específica
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

module.exports = router;
