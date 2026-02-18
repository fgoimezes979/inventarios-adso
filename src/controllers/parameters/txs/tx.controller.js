const Tx = require("../../../models/parameters/txs/tx.model");
const Out = require("../../../models/parameters/outs/out.model");

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
    const {
      date,
      description,
      user,
      user_creates_id,
      product_id,
      location_id,
      quantity,
      balance,
    } = req.body;

    if (!date) return res.status(400).json({ status: false, msg: "La fecha es obligatoria" });
    if (!product_id || !quantity) return res.status(400).json({ status: false, msg: "Producto y cantidad son obligatorios" });

    const newTx = await Tx.create({
      date,
      description: description || "Entrada manual",
      user: user ?? "Sistema",
      user_creates_id: user_creates_id ?? null,
      product_id,
      location_id,
      quantity,
      balance,
      type: "ENTRY", // 👈 Entrada manual
    });

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
=========================================================== */
async function createMovementFromOrder(order, transaction = null) {
  try {
    if (!order.products || order.products.length === 0) {
      console.warn(`⚠️ La orden #${order.id} no tiene productos asociados.`);
      return;
    }

    const accion = "Salieron";

    for (const item of order.products) {
      // Cantidad real del pivot OrderProduct
      const qty = item.quantity ?? item.OrderProduct?.quantity ?? 0;

      // Precio unitario y total
      const unitPrice = item.sale_price ?? item.OrderProduct?.unit_price ?? 0;
      const totalPrice = unitPrice * qty;

      // Código del producto
      const codeProduct = item.code ?? item.Product?.code ?? "N/A";

      // Cliente
      const clientName = order.client?.name ?? "N/A";

      // Usuario
      const userName = order.user || "Sistema";
      const userId = order.user_id || null;

      // 1️⃣ Registrar en Tx (movimiento)
      await Tx.create(
        {
          date: new Date(),
          description: `${accion} ${qty} ${item.name} de la orden #${order.id} — Estado: ${order.state || "N/A"}`,
          user: userName,
          user_creates_id: userId,
          order_id: order.id,
          product_id: item.id || item.product_id,
          quantity: qty,
          type: "EXIT" // 👈 clave: salida
        },
        { transaction }
      );

      // 2️⃣ Registrar en Out (para stock/finanzas)
      await Out.create(
        {
          date: new Date(),
          order_id: order.id,
          product_id: item.id || item.product_id,
          code_product: codeProduct, // único
          client: clientName,
          user: userName,
          user_id: userId,
          location_id: order.location_id,
          quantity: qty,
          salePrice: unitPrice,
          totalPrice: totalPrice,
          is_active: true
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
   📋 REPORTE DE MOVIMIENTOS (entradas y salidas juntas)
=========================================================== */
async function getReport(req, res) {
  try {
    // Traemos todos los movimientos de Tx (ENTRY + EXIT)
    const txs = await Tx.findAll({
      order: [["created_at", "DESC"]],
      include: [
        { association: "product" }, // si tienes relación Product
        { association: "order" } // si quieres info de la orden
      ]
    });

    return res.status(200).json({
      status: true,
      msg: "Reporte generado correctamente",
      txs
    });
  } catch (error) {
    console.error("❌ Error generando reporte:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al generar reporte"
    });
  }
}
/* ===========================================================
   🔍 MOSTRAR MOVIMIENTO POR ID
=========================================================== */
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Tx.findByPk(id);

    if (!tx) return res.status(404).json({ status: false, msg: "Movimiento no encontrado" });

    return res.status(200).json({
      status: true,
      tx,
    });
  } catch (error) {
    console.error("❌ Error al mostrar movimiento:", error);
    return res.status(500).json({ status: false, msg: "Error interno al mostrar movimiento" });
  }
};

module.exports = { index, show, create, createMovementFromOrder,getReport };
