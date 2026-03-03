const { Op } = require("sequelize");
const { Order, Product, Client, Location, OrderProduct, OperationDetail, LocationProduct } = require("../../../models/model-index");
const Operation = require("../../../models/parameters/operations/operation.model"); // 👈 agregar esto
const sequelize = require("../../../models/database/dbconnection");
const Out = require("../../../models/parameters/outs/out.model");
const { createMovementFromOrder } = require("../../../controllers/parameters/txs/tx.controller");
const JournalEntry = require("../../../models/accounting/JournalEntry.model");
const { createJournalsFromOperation } = require("../../../services/accounting/createJournals");




/* ===========================================================
   📦 LISTAR ÓRDENES (USANDO total_price DE LA BD)
=========================================================== */
const index = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Client, as: "client" },
        { model: Location, as: "location" }
      ],
      order: [["id", "DESC"]],
    });

    const ordersFormatted = orders.map(order => {
      const plain = order.toJSON();

      return {
        ...plain,
        // 👇 usamos el total de la BD, REAL
        total_price: Number(plain.total_price) || 0,

        cliente: plain.client?.name || "N/A",
        estadoTraducido:
          plain.state === "PENDING"
            ? "Pendiente"
            : plain.state === "IN_PROGRESS"
            ? "En camino / En proceso"
            : plain.state === "DELIVERED"
            ? "Entregado / Despachado"
            : "N/A",
      };
    });

    res.json(ordersFormatted);

  } catch (error) {
    console.error("❌ Error al listar órdenes:", error);
    res.status(500).json({ error: "Error al listar órdenes" });
  }
};

// MOSTRAR ORDEN PARA EDITAR
const show = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        { model: Location, as: "location" },
        {
          model: Product,
          as: "products",
          attributes: ["id", "code", "name", "sale_price"],
          through: { attributes: ["quantity", "unit_price", "total"] }, // ← NOMBRE REAL
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    const productsForEdit = order.products.map(p => ({
      product_id: p.id,
      product_code: p.code,
      product_name: p.name,
      unit_price: Number(p.OrderProduct.unit_price),
      quantity: Number(p.OrderProduct.quantity),
      total: Number(p.OrderProduct.total) // ← nombre real
    }));

    const total_price = productsForEdit.reduce((sum, p) => sum + p.total, 0);

    res.json({
      ...order.toJSON(),
      products: productsForEdit,
      total_price,
    });

  } catch (error) {
    console.error("❌ Error al obtener la orden:", error);
    res.status(500).json({ message: "Error al obtener la orden" });
  }
};


/* ===========================================================
   🏬 FILTRAR PRODUCTOS POR UBICACIÓN (para usar al crear orden)
=========================================================== */
const getProductsByLocation = async (req, res) => {
  try {
    const { location_id } = req.params;

    // Verificar ID
    if (!location_id) {
      return res.status(400).json({
        status: false,
        msg: "Debe especificar una ubicación válida",
      });
    }

    // Buscar la ubicación
    const location = await Location.findByPk(location_id);

    if (!location) {
      return res.status(404).json({
        status: false,
        msg: "Ubicación no encontrada",
        products: [],
      });
    }

    let productsInLocation = [];

    try {
      const desc = location.description?.trim();

      if (desc) {
        // 🟢 1. Si empieza con [, intenta parsear el JSON
        if (desc.startsWith("[")) {
          // Si tiene un ";" al final, corta antes del punto y coma
          const jsonPart = desc.split("];")[0] + "]";
          productsInLocation = JSON.parse(jsonPart);

          // 🟡 2. Si hay texto después del JSON, también lo parsea
          const textPart = desc.split("];")[1];
          if (textPart) {
            const extras = textPart.split(";").map((item) => {
              const [name, qty] = item.split(",");
              return {
                name: name?.trim(),
                quantity: Number(qty) || 0,
              };
            });
            productsInLocation = [...productsInLocation, ...extras];
          }
        } else {
          productsInLocation = location.description.split(";").map((item) => {
            const [name, qty] = item.split(",");
            return { name: name?.trim(), quantity: Number(qty) || 0 };
          });
        }
      }
    } catch (error) {
      console.warn("⚠️ Error al parsear descripción de ubicación:", error);
    }

    // Si no hay productos registrados
    if (!productsInLocation.length) {
      return res.status(200).json({
        status: true,
        msg: "No hay productos registrados en esta ubicación",
        products: [],
      });
    }

    // Buscar en la tabla Product por nombre o ID
    const products = await Product.findAll({
      where: {
        name: productsInLocation.map((p) => p.name),
      },
    });

    // Combinar info del producto con cantidad disponible
    const result = products.map((p) => {
      const match = productsInLocation.find((x) => x.name === p.name);
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        sale_price: p.sale_price,
        availableQuantity: match ? match.quantity : 0,
      };
    });

    return res.status(200).json({
      status: true,
      msg: "Productos encontrados en la ubicación",
      products: result,
    });
  } catch (error) {
    console.error("❌ Error al obtener productos por ubicación:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al obtener productos por ubicación",
    });
  }
};




// CREAR ORDEN
const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log("📥 BODY RECIBIDO EN ORDEN:", req.body);

    const {
      products,
      state,
      date,
      due_date,
      client_id,
      location_id,
      user_creates_id,
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "Debe enviar productos válidos",
      });
    }

    // ============================
    // 1️⃣ CREAR ORDEN
    // ============================
    const order = await Order.create(
      {
        date,
        due_date,
        state,
        client_id,
        location_id,
        user_creates_id,
        subtotal: 0,
        tax: 0,
        total_price: 0,
      },
      { transaction: t }
    );

    let totalSubtotal = 0;
    let totalTax = 0;
    let totalInvoice = 0;
    let totalCost = 0;

    // ============================
    // 2️⃣ GUARDAR PRODUCTOS Y STOCK
    // ============================
    for (const item of products) {

      const product = await Product.findByPk(item.product_id, {
        transaction: t,
      });

      if (!product) throw new Error("Producto no encontrado");

      const qty = Number(item.quantity);

      if (product.quantity < qty) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const unitPrice = Number(item.unit_price ?? product.sale_price);

      // 🔹 SUBTOTAL
      const lineSubtotal = qty * unitPrice;

      // 🔹 IVA DINÁMICO
      const taxRate = Number(product.taxRate ?? 0);
      const lineTax = lineSubtotal * (taxRate / 100);

      // 🔹 TOTAL LÍNEA
      const lineTotal = lineSubtotal + lineTax;

      // 🔹 COSTO (para asiento costo venta)
      const cost = Number(product.purchase_price) * qty;

      await OrderProduct.create(
        {
          order_id: order.id,
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
          total: lineTotal,
        },
        { transaction: t }
      );

      // 🔹 DESCONTAR STOCK GENERAL
      product.quantity -= qty;
      await product.save({ transaction: t });

      // 🔹 DESCONTAR STOCK POR UBICACIÓN
      const locProd = await LocationProduct.findOne({
        where: { product_id: product.id, location_id },
        transaction: t,
      });

      if (!locProd || locProd.stock < qty) {
        throw new Error(`Stock insuficiente en ubicación para ${product.name}`);
      }

      locProd.stock -= qty;
      await locProd.save({ transaction: t });

      // 🔹 ACUMULAR TOTALES
      totalSubtotal += lineSubtotal;
      totalTax += lineTax;
      totalInvoice += lineTotal;
      totalCost += cost;
    }

    // ============================
    // 3️⃣ ACTUALIZAR TOTALES ORDEN
    // ============================
    await order.update(
      {
        subtotal: totalSubtotal,
        tax: totalTax,
        total_price: totalInvoice,
      },
      { transaction: t }
    );

    // ============================
    // 4️⃣ CREAR OPERATION
    // ============================
    const operation = await Operation.create(
{
  date: new Date(),
  description: `Venta de mercancía – Orden #${order.id}`,
  type: "SALE",

  base_amount: totalSubtotal,   // 🔥 aquí está el cambio
  tax_amount: totalTax,         // 🔥 aquí está el cambio
  total: totalInvoice,
  amount: totalInvoice,

  user: user_creates_id ?? "Sistema",
  location_id,
  order_id: order.id,
  is_active: true,
},
{ transaction: t }
);

// ============================
// 5️⃣ CREAR OPERATION DETAILS
// ============================
for (const item of products) {

  const product = await Product.findByPk(item.product_id, {
    transaction: t,
  });

  await OperationDetail.create(
    {
      operation_id: operation.id,
      product_id: product.id,
      quantity: item.quantity,
      sale_price: item.unit_price ?? product.sale_price,
      purchase_price: product.purchase_price,
      type: "SALE",
      is_active: true,
    },
    { transaction: t }
  );
}
    // ============================
    // 5️⃣ CONTABILIDAD
    // ============================
    await createJournalsFromOperation(operation, t);

    await t.commit();

    return res.status(201).json({
      status: true,
      msg: "Orden creada con IVA y contabilidad automática ✅",
      order,
      operation,
    });

  } catch (error) {
    if (!t.finished) await t.rollback();

    console.error("❌ Error creando orden:", error);

    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};
/* ===========================================================
   ✏️ ACTUALIZAR ORDEN (con stock correcto + totales correctos)
=========================================================== */
const update = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { state, products, location_id, user_creates_id } = req.body;

    /* ======================================
       1️⃣ TRAER ORDEN ACTUAL CON PRODUCTOS
    ======================================= */
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "unit_price", "total"] },
        },
      ],
      transaction: t,
    });

    if (!order) throw new Error("Orden no encontrada");

    const previousState = order.state;

    /* ======================================
       2️⃣ REPONER STOCK ANTERIOR (ANTES DE EDITAR)
    ======================================= */
    for (const oldProduct of order.products) {
      const prevQty = oldProduct.OrderProduct.quantity;

      // Stock general
      await oldProduct.update(
        { quantity: oldProduct.quantity + prevQty },
        { transaction: t }
      );

      // Stock por ubicación
      const locProd = await LocationProduct.findOne({
        where: {
          product_id: oldProduct.id,
          location_id: order.location_id,
        },
        transaction: t,
      });

      if (locProd) {
        await locProd.update(
          { stock: locProd.stock + prevQty },
          { transaction: t }
        );
      }
    }

    /* ======================================
       3️⃣ ACTUALIZAR ESTADO SI VIENE
    ======================================= */
    if (state) {
      await order.update({ state }, { transaction: t });
    }

    /* ======================================
       4️⃣ REEMPLAZAR PRODUCTOS Y RECALCULAR TOTAL
    ======================================= */
    let totalPrice = 0;

    if (products?.length) {
      // eliminar pivote anterior
      await OrderProduct.destroy({
        where: { order_id: id },
        transaction: t,
      });

      // recorrer nuevos productos
      for (const item of products) {
        const product = await Product.findByPk(item.product_id, {
          attributes: ["id", "sale_price", "purchasePrice", "quantity"],
          transaction: t,
        });

        if (!product)
          throw new Error(`Producto ${item.product_id} no encontrado`);

        const unitPrice = Number(item.unit_price ?? product.sale_price);
        const lineTotal = unitPrice * item.quantity;

        totalPrice += lineTotal;

        // crear pivote nuevo
        await OrderProduct.create(
          {
            order_id: id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total: lineTotal,
          },
          { transaction: t }
        );

        // descontar stock general
        await product.update(
          { quantity: product.quantity - item.quantity },
          { transaction: t }
        );

        // descontar stock por ubicación
        const locProd = await LocationProduct.findOne({
          where: { product_id: product.id, location_id },
          transaction: t,
        });

        if (locProd) {
          await locProd.update(
            { stock: locProd.stock - item.quantity },
            { transaction: t }
          );
        }
      }

      // actualizar total orden
      await order.update(
        { total_price: totalPrice },
        { transaction: t }
      );
    }

    /* ======================================
       5️⃣ OPERACIÓN ÚNICA PARA KARDEX (SALE)
    ======================================= */

    // Buscar operación existente
    let operation = await Operation.findOne({
      where: { order_id: id },
      transaction: t,
    });

    // Si no existe, crearla
    if (!operation) {
      operation = await Operation.create(
        {
          date: new Date(),
          description: `Venta de orden #${id}`,
          type: "SALE", // ✅ correcto según ENUM
          total: totalPrice,
          amount: totalPrice,
          location_id,
          order_id: id,
          user: "admin@prueba.com",
          user_creates_id,
          is_active: true,
        },
        { transaction: t }
      );
    } else {
      // actualizar operación existente
      await operation.update(
        {
          total: totalPrice,
          amount: totalPrice,
          type: "SALE",
          location_id,
        },
        { transaction: t }
      );
    }

    /* ======================================
       6️⃣ RECREAR OPERATION DETAILS (KARDEX)
    ======================================= */

    // eliminar detalles anteriores
    await OperationDetail.destroy({
      where: { operation_id: operation.id },
      transaction: t,
    });

    // crear detalles nuevos por producto
    for (const item of products) {
      await OperationDetail.create(
        {
          operation_id: operation.id,
          product_id: item.product_id,
          quantity: item.quantity,
          type: "SALE",
        },
        { transaction: t }
      );
    }

    /* ======================================
       7️⃣ COSTO CONTABLE SOLO AL ENTREGAR
    ======================================= */
    if (
      previousState !== "DELIVERED" &&
      ["DELIVERED", "DESPACHADO"].includes(order.state)
    ) {
      const orderWithProducts = await Order.findByPk(order.id, {
        include: [
          {
            model: Product,
            as: "products",
            attributes: ["id", "purchasePrice"],
            through: { attributes: ["quantity"] },
          },
        ],
        transaction: t,
      });

      for (const item of orderWithProducts.products) {
        const costTotal =
          item.OrderProduct.quantity * item.purchasePrice;

        // crear operación tipo ADJUST (costo)
        const operationCost = await Operation.create(
          {
            date: new Date(),
            description: `Costo de orden #${order.id}`,
            type: "ADJUST",
            total: costTotal,
            amount: costTotal,
            location_id,
            order_id: id,
            user: "Sistema",
            is_active: true,
          },
          { transaction: t }
        );

        // asiento contable
        await createJournalsFromOperation(
          {
            id: operationCost.id,
            type: "ADJUST",
            total: costTotal,
          },
          t
        );
      }
    }

    /* ======================================
       8️⃣ COMMIT
    ======================================= */
    await t.commit();

    /* ======================================
       9️⃣ RESPUESTA FINAL
    ======================================= */
    const fullOrder = await Order.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        { model: Location, as: "location" },
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "unit_price", "total"] },
        },
      ],
    });

    res.status(200).json({
      message: "✅ Orden actualizada correctamente",
      order: fullOrder,
    });

  } catch (error) {
    if (!t.finished) await t.rollback();

    console.error("❌ Error al actualizar orden:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===========================================================
   🗑️ ELIMINAR ORDEN Y SUS SALIDAS
=========================================================== */
const destroy = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Borrar salidas relacionadas
    await Out.destroy({ where: { order_id: id }, transaction: t });

    // Borrar relaciones de productos
    await OrderProduct.destroy({ where: { order_id: id }, transaction: t });

    // Borrar la orden
    await order.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "Orden y salidas eliminadas correctamente" });
  } catch (error) {
  if (!t.finished) {
    await t.rollback();
  }
    console.error("❌ Error al eliminar orden:", error);
    res.status(500).json({
      message: "No se pudo eliminar la orden. Puede tener productos asociados o un error de base de datos.",
      error: error.message,
    });
  }
};


module.exports = {
  index,
  show,
  getProductsByLocation, // 👈 añadido aquí
  create,
  update,
  destroy,
};
