const { Router } = require("express");
const router = Router();
const authMiddleware = require("../../../middlewares/auth.middleware");

/** importar los metodos del controlador */
const { index, create, show, update, destroy } = 
require("../../../controllers/parameters/entries/entry.controller");

/** proteger todas las rutas */
router.use(authMiddleware);

/** listar entradas */
router.get("/", index);

/** crear entrada */
router.post("/", create);

/** mostrar entrada */
router.get("/:id", show);

/** actualizar entrada */
router.put("/:id", update);

/** eliminar entrada */
router.delete("/:id", destroy);

module.exports = router;
