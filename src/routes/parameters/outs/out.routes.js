const express = require("express")
const{  Router} = require("express");
const router = Router();
 
/**importar los metodos del controlador */

const {index, create, show, update, destroy} = require("../../../controllers/parameters/outs/out.controller");

/**ruta para el metodo index */
router.get("/" , index);

/**ruta para el meatodo create */

router.post("/" , create);
/**ruta para el metodo show */

router.get("/:id" , show);
/**ruta para actualizar un locationo */

router.put("/:id" , update);
/**ruta para elimunar un locationo */

router.delete("/:id" , destroy);


/**exportamos el modulo */
module.exports = router;
