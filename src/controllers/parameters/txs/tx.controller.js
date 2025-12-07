const Tx = require("../../../models/parameters/txs/tx.model");

/* ===========================================================
   📋 LISTAR MOVIMIENTOS
=========================================================== */
const index = async (req, res) => {
  try {
    const txs = await Tx.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      msg: "Movimientos listados correctamente",
      txs,
    });
  } catch (error) {
    console.error("❌ Error al listar movimientos:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al listar movimientos",
    });
  }
};

/* ===========================================================
   ➕ CREAR MOVIMIENTO MANUAL
=========================================================== */
const create = async (req, res) => {
  try {
    const { date, description, user } = req.body;

    if (!date) {
      return res.status(400).json({
        status: false,
        msg: "La fecha es obligatoria",
      });
    }

    console.log("📥 Body recibido:", req.body);

    const newTx = await Tx.create({
      date,
      description: description || "",
      user: user || "admin",
      user_creates_id: req.body.user_creates_id || null,
      user_updates_id: req.body.user_updates_id || null,
    });

    console.log("✅ Movimiento creado:", newTx);

    return res.status(201).json({
      status: true,
      msg: "Movimiento creado correctamente",
      tx: newTx,
    });
  } catch (error) {
    console.error("❌ Error al crear movimiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al crear movimiento",
    });
  }
};

/* ===========================================================
   ⚙️ CREAR MOVIMIENTOS AUTOMÁTICOS DESDE UNA ORDEN
   (solo salidas)
=========================================================== */
async function createMovementFromOrder(order, transaction = null) {
  try {
    if (!order.products || order.products.length === 0) {
      console.warn(`⚠️ La orden #${order.id} no tiene productos asociados.`);
      return;
    }

    // 🔹 Como solo manejas salidas:
    const tipo = "Salida";
    const accion = "Salieron";

    for (const item of order.products) {
      // Maneja casos en que quantity esté en el modelo intermedio (OrderProduct)
      const qty = item.quantity ?? item.OrderProduct?.quantity ?? 0;

      await Tx.create(
        {
          date: new Date(),
          description: `${accion} ${qty} ${item.name} de la orden #${order.id} — Estado: ${order.state || "N/A"}`,
          user: order.user || "Sistema",
          user_creates_id: order.user_id || null,
          order_id: order.id,
          product_id: item.id || item.product_id,
          quantity: qty,
          type: tipo, // Siempre "Salida"
        },
        { transaction }
      );
    }

    console.log(`✅ Movimientos creados automáticamente para la orden #${order.id}`);
  } catch (error) {
    console.error("❌ Error creando movimientos desde la orden:", error);
    throw error;
  }
}

/* ===========================================================
   🔍 MOSTRAR MOVIMIENTO POR ID
=========================================================== */
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Tx.findByPk(id);

    if (!tx) {
      return res.status(404).json({
        status: false,
        msg: "Movimiento no encontrado",
      });
    }

    return res.status(200).json({
      status: true,
      tx,
    });
  } catch (error) {
    console.error("❌ Error al mostrar movimiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al mostrar movimiento",
    });
  }
};

module.exports = { index, show, create, createMovementFromOrder };
