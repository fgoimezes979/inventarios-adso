const { Category } = require("../../../models/model-index");

/* ======================================
   LISTAR CATEGORIAS
====================================== */
const index = async (req, res) => {

  try {

    const categories = await Category.findAll({
      order: [["name", "ASC"]]
    });

    return res.status(200).json({
      status: true,
      msg: "Categorías listadas correctamente",
      categories
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      status: false,
      msg: "Error al listar categorías"
    });

  }

};


/* ======================================
   CREAR CATEGORIA
====================================== */
const create = async (req, res) => {

  try {

    const { name, description } = req.body;

    const category = await Category.create({
      name,
      description
    });

    return res.status(201).json({
      status: true,
      msg: "Categoría creada correctamente",
      category
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      status: false,
      msg: "Error al crear categoría"
    });

  }

};


/* ======================================
   ELIMINAR CATEGORIA
====================================== */
const destroy = async (req, res) => {

  try {

    const { id } = req.params;

    await Category.destroy({
      where: { id: id }
    });

    return res.status(200).json({
      status: true,
      msg: "Categoría eliminada correctamente"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      status: false,
      msg: "Error al eliminar categoría"
    });

  }

};


module.exports = { index, create, destroy };
