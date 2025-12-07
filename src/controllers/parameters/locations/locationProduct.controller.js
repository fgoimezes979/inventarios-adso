const { Location, Product, LocationProduct } = require('../../../models/model-index');

// 🔹 Función para actualizar description de la ubicación
const updateLocationDescription = async (location_id) => {
  const locationProducts = await LocationProduct.findAll({
    where: { location_id },
    include: [{ model: Product, as: 'product' }]
  });

  const description = locationProducts.map(lp => {
    const name = lp.product?.name || 'Producto';
    return `${name} (${lp.stock})`;
  }).join(', ');

  const location = await Location.findByPk(location_id);
  if (!location) throw new Error('Ubicación no encontrada');

  location.description = description;
  await location.save();

  return location;
};

// 🔹 Controlador assign
const assign = async (req, res) => {
  try {
    const { location_id, product_id, stock } = req.body;

    if (!location_id || !product_id)
      return res.status(400).json({ status: false, msg: "Faltan datos" });

    let record = await LocationProduct.findOne({
      where: { location_id, product_id }
    });

    let result;
    if (record) {
      result = await record.update({ stock });
    } else {
      result = await LocationProduct.create({ location_id, product_id, stock });
    }

    // 🔹 Actualizar description de la ubicación
    const location = await updateLocationDescription(location_id);

    return res.status(200).json({
      status: true,
      msg: "Stock asignado correctamente",
      data: result,
      locationDescription: location.description
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Error en LocationProduct", error });
  }
};

module.exports = { assign };
