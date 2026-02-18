const { Router } = require("express");
const router = Router();
const authMiddleware = require("../../../middlewares/auth.middleware");

/** importar los metodos del controlador */
const { index, create, show, update, destroy } =
require("../../../controllers/parameters/suppliers/supplier.controller");

/** proteger todas las rutas */
router.use(authMiddleware);

/** rutas */
router.get("/", index);
router.post("/", create);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

module.exports = router;
