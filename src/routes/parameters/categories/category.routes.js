const { Router } = require("express");
const router = Router();
const authMiddleware = require("../../../middlewares/auth.middleware");

/** importar metodos del controlador */
const { index, create, destroy } =
require("../../../controllers/parameters/categories/category.controller");

/** proteger rutas */
router.use(authMiddleware);

/** rutas */
router.get("/", index);
router.post("/", create);
router.delete("/:id", destroy);

module.exports = router;