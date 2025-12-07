const { Entry, Product, Location, Operation } = require('../../../models/model-index');
const LocationProduct = require("../../../models/parameters/locations/locationProduct.model");

/* ===========================================================
   📋 LISTAR ENTRADAS
=========================================================== */
const index = async (req, res) => {
  try {
    const entries = await Entry.findAll({
      include: [
        { model: Location, as: "location", attributes: ["id", "name"] },
        { model: Product, as: "product", attributes: ["id", "name", "code"] }
      ],
      order: [["created_at", "DESC"]]
    });

    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      code_product: entry.code_product,
      quantity: entry.quantity,
      date: entry.date,
      user: entry.user,
      is_active: entry.is_active,
      productName: entry.product?.name || "N/A",
      locationName: entry.location?.name || "N/A",
      product: entry.product || null,
      location: entry.location || null
    }));

    return res.status(200).json({
      status: true,
      msg: "Listado de entradas correcto",
      entries: formattedEntries
    });

  } catch (error) {
    console.error("Error al listar entradas:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
      entries: []
    });
  }
};

/* ===========================================================
   🟢 CREAR ENTRADA
=========================================================== */
const create = async (req, res) => {
  try {
    const { code_product, product_id, quantity, date, location_id, user } = req.body;

    if (!code_product || !product_id || !quantity || !location_id) {
      return res.status(400).json({ status: false, msg: 'Faltan datos obligatorios' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ status: false, msg: 'Cantidad inválida' });
    }

    const newEntry = await Entry.create({
      code_product,
      product_id,
      quantity: qty,
      date: date || new Date(),
      location_id,
      user: user || "admin",
      is_active: true,
      user_creates_id: 1
    });

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ status: false, msg: 'Producto no encontrado' });
    }

    product.quantity = Number(product.quantity || 0) + qty;
    await product.save();

    let lp = await LocationProduct.findOne({ where: { location_id, product_id } });
    if (lp) {
      lp.stock = Number(lp.stock) + qty;
      await lp.save();
    } else {
      lp = await LocationProduct.create({ location_id, product_id, stock: qty });
    }

    const newOperation = await Operation.create({
      date: date || new Date(),
      description: `Entrada de ${qty} ${product.name}`,
      user: user || "sistema",
      purchasePrice: product.purchasePrice,
      quantity: qty,
      type: "INCOME",
      balance: product.quantity,
      is_active: true,
      user_creates_id: 1
    });

    return res.status(201).json({
      status: true,
      msg: 'Entrada creada y stock actualizado correctamente',
      entry: {
        ...newEntry.toJSON(),
        productName: product.name,
        location_id,
        location_stock: lp.stock
      },
      product_stock: product.quantity,
      operation: newOperation
    });

  } catch (error) {
    console.error('Error creando entrada:', error);
    return res.status(500).json({ status: false, msg: 'Error interno', error: error.message });
  }
};

/* ===========================================================
   📌 OBTENER UNA ENTRADA
=========================================================== */
const show = async (req, res) => {
  const { id } = req.params;

  const entry = await Entry.findByPk(id, {
    include: [
      { model: Location, as: "location", attributes: ["id", "name"] },
      { model: Product, as: "product", attributes: ["id", "name", "code"] }
    ]
  });

  if (!entry) {
    return res.status(404).json({ status: false, msg: "Entrada no encontrada", entry: null });
  }

  return res.status(200).json({
    status: true,
    msg: "Entrada encontrada",
    entry: {
      ...entry.toJSON(),
      productName: entry.product?.name || "N/A",
      locationName: entry.location?.name || "N/A"
    }
  });
};

/* ===========================================================
   ✏️ ACTUALIZAR
=========================================================== */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);
    if (!entry) {
      return res.status(404).json({ status: false, msg: "Entrada no encontrada" });
    }

    await entry.update(req.body);

    // <-- FIX IMPORTANTE: volver a cargar con relaciones
    const updatedEntry = await Entry.findByPk(id, {
      include: [
        { model: Location, as: "location", attributes: ["id", "name"] },
        { model: Product, as: "product", attributes: ["id", "name", "code"] }
      ]
    });

    return res.status(200).json({
      status: true,
      msg: "Entrada actualizada correctamente",
      entry: {
        ...updatedEntry.toJSON(),
        productName: updatedEntry.product?.name || "N/A",
        locationName: updatedEntry.location?.name || "N/A"
      }
    });

  } catch (error) {
    console.error("Error al actualizar entrada:", error);
    return res.status(500).json({ status: false, msg: "Error interno del servidor" });
  }
};

/* ===========================================================
   🗑️ ELIMINAR
=========================================================== */
const destroy = async (req, res) => {
  const { id } = req.params;
  const entry = await Entry.findByPk(id);

  if (!entry) {
    return res.status(404).json({ status: false, msg: "Entrada no encontrada" });
  }

  await entry.destroy();

  return res.status(200).json({
    status: true,
    msg: "Entrada eliminada correctamente",
    entry
  });
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy
};
