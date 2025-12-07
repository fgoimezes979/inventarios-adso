const express = require("express");
const { Router } = require("express");
const router = Router();

/** Importar los métodos del controlador de órdenes */
const { index, create, show, update, destroy } = require("../../../controllers/parameters/orders/order.controller");

/** ✅ Importar la función getProductsByLocation desde el controlador de productos */
const { getProductsByLocation } = require("../../../controllers/parameters/products/product.controller");

/** Rutas principales */
router.get("/", index);
router.post("/", create);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

/** 🔹 Nueva ruta: obtener productos según la ubicación seleccionada */
router.get("/location/:location_id/products", getProductsByLocation);

/** Exportar el módulo */
module.exports = router;
