const { Op } = require("sequelize");
const { Order, Product, Client, Location, OrderProduct, LocationProduct } = require("../../../models/model-index");
const Operation = require("../../../models/parameters/operations/operation.model"); // 👈 agregar esto
const sequelize = require("../../../models/database/dbconnection");
const Out = require("../../../models/parameters/outs/out.model");
const { createMovementFromOrder } = require("../../../controllers/parameters/txs/tx.controller");

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
    let { products, product_id, quantity, state, date, due_date, client_id, location_id, user_creates_id } = req.body;

    // Si no viene un array de productos, convertir a array
    if (!Array.isArray(products)) {
      products = product_id && quantity ? [{ product_id, quantity }] : [];
    }

    if (products.length === 0) {
      return res.status(400).json({ message: "Debe enviar al menos un producto válido" });
    }

    // 1️⃣ Crear orden principal
    const order = await Order.create(
      { date, state, due_date, client_id, location_id, user_creates_id, total_price: 0 },
      { transaction: t }
    );

    let totalPrice = 0;

    // 2️⃣ Procesar productos
    for (const item of products) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (!product) throw new Error(`Producto con ID ${item.product_id} no encontrado`);

    const unitPrice = Number(item.unit_price ?? product.sale_price);
const lineTotal = unitPrice * item.quantity;


      // Crear línea pivote
      await OrderProduct.create(
        {
          order_id: order.id,
          product_id: product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          total: lineTotal
        },
        { transaction: t }
      );

      // Stock general
      await product.update(
        { quantity: Math.max(product.quantity - item.quantity, 0) },
        { transaction: t }
      );

      // Stock por ubicación
      const locationProduct = await LocationProduct.findOne({
        where: { product_id: product.id, location_id },
        transaction: t,
      });

      if (locationProduct) {
        await locationProduct.update(
          { stock: Math.max(locationProduct.stock - item.quantity, 0) },
          { transaction: t }
        );
      }

      totalPrice += lineTotal;
    }

    // 3️⃣ Actualizar total de la orden
    await order.update({ total_price: totalPrice }, { transaction: t });

    // 4️⃣ Crear salidas automáticas
    const estadoUpper = state?.toUpperCase() || "";
    if (["IN_PROGRESS", "DELIVERED", "EN CAMINO", "DESPACHADO"].includes(estadoUpper)) {
      const clientData = await Client.findByPk(client_id, { transaction: t });
      const clientName = clientData ? clientData.name : "Cliente no especificado";

      for (const item of products) {
        const product = await Product.findByPk(item.product_id, {
          attributes: ["id", "code", "name", "sale_price"],
          transaction: t,
        });

        if (!product || !product.code) continue;

        const salePrice = Number(product.sale_price ?? 0);
        const uniqueCode = `${product.code}-${order.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await Out.create(
          {
            order_id: order.id,
            code_product: uniqueCode,
            product_id: product.id,
            location_id,
            date: date || new Date(),
            client: clientName,
            user: user_creates_id ?? "Sistema",
            quantity: item.quantity,
            salePrice,
            totalPrice: salePrice * item.quantity,
            is_active: true,
          },
          { transaction: t }
        );
      }
    }

    // =============================
    // 5️⃣ CREAR OPERACIÓN CORRECTA
    // =============================

    const validTotalPrice = Number(totalPrice) || 0;

    // Última operación del sistema
    const lastOperationGeneral = await Operation.findOne({
      order: [["created_at", "DESC"]],
      transaction: t,
    });

    const previousBalance = lastOperationGeneral ? Number(lastOperationGeneral.balance) : 0;

    // Buscar operación existente de esta orden
    const lastOperationOrder = await Operation.findOne({
      where: { description: `Venta de orden #${order.id}` },
      transaction: t,
    });

    if (lastOperationOrder) {
      // Actualizar si existe
      await lastOperationOrder.update(
        {
          salePrice: validTotalPrice,
          outcome: validTotalPrice,
          total: validTotalPrice,
          balance: previousBalance - validTotalPrice,
          updated_at: new Date(),
          user_updates_id: user_creates_id,
        },
        { transaction: t }
      );
    } else {
      // Crear si no existe
      await Operation.create(
        {
          date: new Date(),
          description: `Venta de orden #${order.id}`,
          type: "OUTCOME",
          quantity: 1,
          purchasePrice: 0,
          salePrice: validTotalPrice,
          outcome: validTotalPrice,
          total: validTotalPrice,
          user: user_creates_id ?? "Sistema",
          balance: previousBalance - validTotalPrice,
          user_creates_id,
          is_active: true,
        },
        { transaction: t }
      );
    }

    // 6️⃣ Crear movimientos (Tx)
    const orderWithProducts = await Order.findByPk(order.id, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "name", "code"],
          through: { attributes: ["quantity"] },
        },
      ],
      transaction: t,
    });

    await createMovementFromOrder(
      {
        id: orderWithProducts.id,
        user: user_creates_id,
        products: orderWithProducts.products,
        state: order.state,
      },
      t
    );

    // 7️⃣ Confirmar transacción
    await t.commit();

    // 8️⃣ Recargar orden completa
    const fullOrder = await Order.findByPk(order.id, {
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

    const productsForEdit = fullOrder.products.map(p => ({
      ...p.toJSON(),
      total: p.OrderProduct.total || (p.OrderProduct.quantity * p.OrderProduct.unit_price),
    }));

    return res.status(201).json({
      status: true,
      message: "Orden creada exitosamente",
      order: {
        ...fullOrder.toJSON(),
        products: productsForEdit,
        total_price: totalPrice,
      },
    });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error creando orden:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Ocurrió un error inesperado al crear la orden",
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

    const order = await Order.findByPk(id, {
      include: [
        { model: Product, as: "products" }
      ],
      transaction: t,
    });

    if (!order) throw new Error("Orden no encontrada");

    /* ======================================
       1️⃣ REPOSICIÓN DE STOCK ANTES DE CAMBIAR
    ======================================= */
    for (const old of order.products) {
      const prevQty = old.OrderProduct.quantity;

      // Stock general
      await old.update(
        { quantity: old.quantity + prevQty },
        { transaction: t }
      );

      // Stock por ubicación
      const locProd = await LocationProduct.findOne({
        where: { product_id: old.id, location_id: order.location_id },
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
       2️⃣ ACTUALIZAR ESTADO
    ======================================= */
    if (state) {
      await order.update({ state }, { transaction: t });
    }

    /* ======================================
       3️⃣ REEMPLAZAR PRODUCTOS Y RECALCULAR TOTAL
    ======================================= */
    let totalPrice = 0;

    if (products?.length) {
      await OrderProduct.destroy({ where: { order_id: id }, transaction: t });

      for (const item of products) {
        const product = await Product.findByPk(item.product_id, {
          attributes: ["id", "sale_price", "quantity"],
          transaction: t,
        });

        if (!product)
          throw new Error(`Producto ${item.product_id} no encontrado`);

       const unitPrice = Number(item.unit_price ?? product.sale_price);

        const lineTotal = unitPrice * item.quantity;
        totalPrice += lineTotal;

        // Crear pivote
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

        // Stock general
        await product.update(
          { quantity: Math.max(product.quantity - item.quantity, 0) },
          { transaction: t }
        );

        // Stock por ubicación
        if (location_id) {
          const locationProduct = await LocationProduct.findOne({
            where: { product_id: product.id, location_id },
            transaction: t,
          });

          if (locationProduct) {
            await locationProduct.update(
              { stock: Math.max(locationProduct.stock - item.quantity, 0) },
              { transaction: t }
            );
          }
        }
      }

      // Actualizar total de la orden
      await order.update({ total_price: totalPrice }, { transaction: t });
    }

    /* ======================================
       4️⃣ OPERACIÓN FINANCIERA
    ======================================= */
    const existingOp = await Operation.findOne({
      where: { description: `Venta de orden #${id}` },
      transaction: t,
    });

    const validTotal = Number(totalPrice) || order.total_price || 0;

    if (existingOp) {
      // Volver a calcular balance REAL
      const lastOp = await Operation.findOne({
        order: [["created_at", "DESC"]],
        transaction: t,
      });

      const previousBalance = lastOp ? Number(lastOp.balance) : 0;

      await existingOp.update(
        {
          salePrice: validTotal,
          outcome: validTotal,
          total: validTotal,
          balance: previousBalance - validTotal,
        },
        { transaction: t }
      );
    } else {
      const lastOp = await Operation.findOne({
        order: [["created_at", "DESC"]],
        transaction: t,
      });

      const previousBalance = lastOp ? Number(lastOp.balance) : 0;

      await Operation.create(
        {
          date: new Date(),
          description: `Venta de orden #${id}`,
          quantity: 1,
          salePrice: validTotal,
          purchasePrice: 0,
          outcome: validTotal,
          type: "OUTCOME",
          total: validTotal,
          balance: previousBalance - validTotal,
          user_creates_id,
          is_active: true,
        },
        { transaction: t }
      );
    }

    await t.commit();

    /* ======================================
       5️⃣ DEVOLVER ORDEN COMPLETA
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

    const productsForEdit = fullOrder.products.map(p => ({
      ...p.toJSON(),
      total: p.OrderProduct.total,
    }));

    res.status(200).json({
      message: "Orden actualizada correctamente",
      order: {
        ...fullOrder.toJSON(),
        products: productsForEdit,
      },
    });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error al actualizar orden:", error);
    res.status(500).json({ message: error.message });
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
    await t.rollback();
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
