const{  Router} = require("express");
const router = Router();
 
/**importar los metodos del controlador */

const{login, index, create, show, update, destroy} = require("../../../controllers/parameters/security/user.controllers");


router.post("/login" , login);
/**ruta para el metodo show */


/**ruta para el metodo index */
router.get("/" , index);

/**ruta para el meatodo create */


router.post("/" , create);
/**ruta para actualizar una marca */


router.get("/:id" , show);
/**ruta para actualizar una marca */

router.put("/:id" , update);
/**ruta para elimunar una marca */

router.delete("/:id" , destroy);


/**exportamos el modulo */
module.exports = router;

