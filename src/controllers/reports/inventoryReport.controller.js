const {
  Operation,
  OperationDetail,
  Product,
  Location,
  LocationProduct
} = require("../../models/model-index");

const { Op } = require("sequelize");

/* ============================
   🔹 TIPOS ESTÁNDAR
============================ */
const TYPES = {
  ENTRY: "ENTRY",
  SALE: "SALE",
  RETURN: "RETURN",
  TRANSFER: "TRANSFER",
  ADJUST: "ADJUST"
};

const VALID_TYPES = Object.values(TYPES);

/* ===========================================================
   📌 REPORTE DE INVENTARIO (KARDEX CENTRALIZADO)
=========================================================== */
const getInventoryReport = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
      product_id,
      location_id,
      lowStockThreshold
    } = req.query;

    /* ========================
       🔹 FILTRO FECHAS
    ======================== */
    let dateCondition = {};

    if (startDate || endDate) {
      dateCondition.date = {};

      if (startDate) {
        dateCondition.date[Op.gte] = new Date(startDate + "T00:00:00");
      }

      if (endDate) {
        dateCondition.date[Op.lte] = new Date(endDate + "T23:59:59");
      }
    }

    /* ========================
       🔹 TRAER OPERACIONES
    ======================== */
    const operations = await Operation.findAll({
      where: {
        is_active: true,
        ...dateCondition,
        ...(location_id ? { location_id } : {})
      },
      order: [["date", "ASC"]],
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"]
        },
        {
          model: OperationDetail,
          as: "details",
          required: false,
          where: product_id ? { product_id } : undefined,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });

    /* ========================
       🔹 MAPEAR MOVIMIENTOS
    ======================== */
    const movements = [];

    operations.forEach(op => {

      if (!VALID_TYPES.includes(op.type)) return;

      (op.details || []).forEach(d => {

        if (!d.product) return;

        const costValue =
          Number(d.purchasePrice) ||
          Number(d.product?.cost) ||
          0;

        movements.push({
          product_id: d.product.id,
          product_name: d.product.name,
          movement_type: op.type,
          quantity: Number(d.quantity) || 0,

          cost: costValue,
          subtotal_cost: costValue * (Number(d.quantity) || 0),

          date: op.date,
          user: op.user || "Sistema",
          location_id: op.location?.id || null,
          location: op.location?.name || "N/A"
        });

      });

    });

    /* ========================
       🔹 TOTALES POR PRODUCTO
    ======================== */
    const totalsByProductMap = {};

    movements.forEach(m => {

      if (!totalsByProductMap[m.product_id]) {
        totalsByProductMap[m.product_id] = {
          product_id: m.product_id,
          product_name: m.product_name,
          entradas: 0,
          salidas: 0,
          balance: 0
        };
      }

      if ([TYPES.ENTRY, TYPES.RETURN].includes(m.movement_type)) {
        totalsByProductMap[m.product_id].entradas += m.quantity;
      }

      if (m.movement_type === TYPES.SALE) {
        totalsByProductMap[m.product_id].salidas += m.quantity;
      }

      totalsByProductMap[m.product_id].balance =
        totalsByProductMap[m.product_id].entradas -
        totalsByProductMap[m.product_id].salidas;

    });

    const totalsByProduct = Object.values(totalsByProductMap);

    /* ========================
       🔹 TOTALES GENERALES
    ======================== */
    let totalEntradas = 0;
    let totalSalidas = 0;

    movements.forEach(m => {
      if ([TYPES.ENTRY, TYPES.RETURN].includes(m.movement_type)) {
        totalEntradas += m.quantity;
      }

      if (m.movement_type === TYPES.SALE) {
        totalSalidas += m.quantity;
      }
    });

    const balanceGeneral = totalEntradas - totalSalidas;

    /* ========================
       🔹 COSTO TOTAL INVENTARIO
    ======================== */
    let totalCost = 0;

    movements.forEach(m => {

      if ([TYPES.ENTRY, TYPES.RETURN].includes(m.movement_type)) {
        totalCost += (Number(m.cost) || 0) * (Number(m.quantity) || 0);
      }

      if (m.movement_type === TYPES.SALE) {
        totalCost -= (Number(m.cost) || 0) * (Number(m.quantity) || 0);
      }

    });

    console.log("🟣 TOTAL COST BACK:", totalCost);

    /* ========================
       🔹 SALDO POR PRODUCTO / UBICACIÓN
    ======================== */
    const balanceMap = {};

    const movementsWithBalance = movements.map(m => {

      const key = `${m.product_id}_${m.location_id}`;

      if (!balanceMap[key]) balanceMap[key] = 0;

      if ([TYPES.ENTRY, TYPES.RETURN].includes(m.movement_type)) {
        balanceMap[key] += m.quantity;
      }

      if (m.movement_type === TYPES.SALE) {
        balanceMap[key] -= m.quantity;
      }

      if (m.movement_type === TYPES.ADJUST) {
        balanceMap[key] += m.quantity;
      }

      return {
        ...m,
        balance: balanceMap[key]
      };
    });

    /* ========================
       🔹 LOW STOCK
    ======================== */
    const products = await Product.findAll({
      where: product_id ? { id: product_id } : {},
      attributes: ["id", "name", "quantity", "minimum_stock"]
    });

    const lowStock = products
      .filter(p =>
        p.quantity <= (lowStockThreshold ?? p.minimum_stock)
      )
      .map(p => ({
        product_id: p.id,
        product_name: p.name,
        quantity: p.quantity,
        minimum_stock: p.minimum_stock
      }));

    /* ========================
       🔹 STOCK POR UBICACIÓN
    ======================== */
    const locationProducts = await LocationProduct.findAll({
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Location, as: "location", attributes: ["id", "name"] }
      ]
    });

    const stockByLocation = locationProducts.map(lp => ({
      product_id: lp.product.id,
      product_name: lp.product.name,
      location: lp.location.name,
      stock: lp.stock
    }));

    /* ========================
       ✅ RESPUESTA FINAL
    ======================== */
    return res.json({
      status: true,

      totals: {
        entradas: totalEntradas,
        salidas: totalSalidas,
        balance: balanceGeneral
      },

      totalCost,
      totalsByProduct,

      movements: movementsWithBalance,
      lowStock,
      stockByLocation
    });

  } catch (error) {
    console.error("❌ Error Kardex:", error);
    return res.status(500).json({
      status: false,
      msg: error.message
    });
  }
};

module.exports = { getInventoryReport };
