const { Op } = require("sequelize");
const { Out, Product, Location, LocationProduct, Order, OrderProduct, sequelize } = require("../../../models/model-index");

/** 📦 Listar todas las salidas incluyendo producto y ubicación */
const index = async (req, res) => {
  try {
    const outs = await Out.findAll({
      include: [
        { model: Product, as: "product", attributes: ["id", "code", "name", "quantity", "salePrice"] },
        { model: Location, as: "location", attributes: ["id", "name", "description"] },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      msg: "Salidas listadas correctamente",
      outs,
    });
  } catch (error) {
    console.error("❌ Error al listar salidas:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      outs: [],
    });
  }
};

/* ===========================================================
   📦 CREAR SALIDAS (Out)
=========================================================== */
const create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // normaliza entrada
    const payload = req.body && req.body.outs ? req.body : { outs: Array.isArray(req.body) ? req.body : [req.body] };
    const outsArray = Array.isArray(payload.outs) ? payload.outs : [payload];

    if (!outsArray.length) throw new Error("No hay datos en el body para procesar.");

    const createdOuts = [];

    for (const item of outsArray) {
      const { product_id, location_id, quantity, client, user, order_id, date } = item;

      if (!product_id || !location_id || !quantity) continue;

      const product = await Product.findByPk(product_id, { transaction: t });
      if (!product) continue;

      if (product.quantity < quantity) continue;

      // 🔥 PRECIO UNITARIO TOMADO DEL PRODUCTO
      const salePrice = product.salePrice ?? 0;

      // 🔥 PRECIO TOTAL CALCULADO
      const totalPrice = salePrice * quantity;

      // generar código único
      const code_product = `${product.code ?? 'CODE'}-${order_id ?? 0}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

      // crear Out
      const newOut = await Out.create({
        code_product,
        product_id,
        location_id,
        order_id: order_id ?? null,
        date: date || new Date(),
        client: client || "Sin cliente",
        user: user || "Sistema",
        quantity,
        salePrice,   // 🔥 ya calculado
        totalPrice,  // 🔥 ya calculado
        is_active: true,
        user_creates_id: req.body.user_creates_id ?? null,
        user_updates_id: null,
      }, { transaction: t });

      createdOuts.push(newOut);

      // descontar stock global
      product.quantity = Math.max(product.quantity - quantity, 0);
      await product.save({ transaction: t });

      // descontar stock por ubicación
      const locationProduct = await LocationProduct.findOne({
        where: { product_id, location_id },
        transaction: t
      });

      if (locationProduct) {
        locationProduct.stock = Math.max(locationProduct.stock - quantity, 0);
        await locationProduct.save({ transaction: t });
      }

      // actualizar descripción dinámica de la ubicación
      const location = await Location.findByPk(location_id, {
        include: { model: Product, as: "products", through: { attributes: ["stock"] } },
        transaction: t
      });

      if (location) {
        const description = location.products
          .map(p => `${p.name} (${p.LocationProduct?.stock ?? 0})`)
          .join(", ") || "Sin descripción";

        await location.update({ description }, { transaction: t });
      }
    }

    await t.commit();

    const outsWithRelations = await Out.findAll({
      where: { id: createdOuts.map(o => o.id) },
      include: [
        { model: Product, as: "product", attributes: ["id", "code", "name", "quantity", "salePrice"] },
        { model: Location, as: "location", attributes: ["id", "name", "description"] },
        { model: Order, as: "order", attributes: ["id", "state", "total_price"] }
      ],
    });

    return res.status(201).json({
      status: true,
      msg: "✅ Outs creados exitosamente",
      outs: outsWithRelations,
    });

  } catch (err) {
    try { await t.rollback(); } catch(e){ console.error("rollback error", e); }
    console.error("❌ Error en create Out:", err);
    return res.status(500).json({ status: false, msg: err.message || "Error interno", outs: [] });
  }
};

/* ===========================================================
   🗑️ ELIMINAR ORDEN Y SUS SALIDAS
=========================================================== */
const destroyOrderAndOuts = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) throw new Error("Orden no encontrada");

    await Out.destroy({ where: { order_id: id }, transaction: t });
    await OrderProduct.destroy({ where: { order_id: id }, transaction: t });

    await order.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ status: true, msg: "✅ Orden y salidas eliminadas correctamente" });
  } catch (err) {
    try { await t.rollback(); } catch(e){ console.error("rollback error", e); }
    console.error("❌ Error eliminando orden:", err);
    res.status(500).json({ status: false, msg: err.message });
  }
};

/** 🔍 Mostrar salida por ID */
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await Out.findByPk(id, {
      include: [
        { model: Product, as: "product", attributes: ["name"] },
        { model: Location, as: "location", attributes: ["name"] },
      ],
    });

    if (!out) {
      return res.status(404).json({
        status: false,
        msg: "Salida no encontrada",
        out: null,
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Salida encontrada correctamente",
      out,
    });
  } catch (error) {
    console.error("❌ Error al mostrar salida:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      out: null,
    });
  }
};

/** ✏️ Actualizar salida */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await Out.findByPk(id);

    if (!out) {
      return res.status(404).json({
        status: false,
        msg: "Salida a actualizar no encontrada",
        out: null,
      });
    }

    await Out.update(req.body, { where: { id } });

    const outUpdated = await Out.findByPk(id, {
      include: [
        { model: Product, as: "product", attributes: ["name"] },
        { model: Location, as: "location", attributes: ["name"] },
      ],
    });

    return res.status(200).json({
      status: true,
      msg: "Salida actualizada correctamente",
      out: outUpdated,
    });
  } catch (error) {
    console.error("❌ Error al actualizar salida:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al actualizar salida",
      out: null,
    });
  }
};

/** 🗑️ Eliminar salida */
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await Out.findByPk(id);

    if (!out) {
      return res.status(404).json({
        status: false,
        msg: "Salida no encontrada",
        out: null,
      });
    }

    await out.destroy();

    return res.status(200).json({
      status: true,
      msg: "Salida eliminada correctamente",
      out,
    });
  } catch (error) {
    console.error("❌ Error al eliminar salida:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al eliminar salida",
      out: null,
    });
  }
};

module.exports = { index, create, show, update, destroy };
