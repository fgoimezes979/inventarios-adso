
const{  Router} = require("express");
const router = Router();
 
/**importar los metodos del controlador */

const {index,  show, create } = require("../../../controllers/parameters/txs/tx.controller");

/**ruta para el metodo index */
router.get("/" , index);

/**ruta para el meatodo create */

router.post("/", create);      // ← Esta es la nueva ruta


router.get("/:id" , show);
/**ruta para actualizar un locationo */




/**exportamos el modulo */
module.exports = router;
