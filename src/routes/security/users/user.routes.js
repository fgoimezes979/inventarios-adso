const { Router } = require("express");
const router = Router();

/** importar middleware */
const authMiddleware = require("../../../middlewares/auth.middleware");

/** importar controladores */
const {
  login,
  index,
  create,
  show,
  update,
  destroy
} = require("../../../controllers/parameters/security/user.controllers");

/** ============================
 *  RUTA PUBLICA
 ============================ */
router.post("/login", login);

/** ============================
 *  PROTEGER TODO LO DEMÁS
 ============================ */
router.use(authMiddleware);

/** rutas protegidas */
router.get("/", index);
router.post("/", create);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

/** exportar modulo */
module.exports = router;
