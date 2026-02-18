const { Entry, Product,EntryDetail, Location, Supplier,OperationDetail, Operation } = require('../../../models/model-index');
const LocationProduct = require("../../../models/parameters/locations/locationProduct.model");
const { createJournalsFromOperation } = require( "../../../services/accounting/createJournals");
const sequelize = require("../../../models/database/dbconnection");




/* ===========================================================
   📌 LISTAR FACTURAS (ENTRIES)
=========================================================== */

const index = async (req, res) => {
  try {

    const entries = await Entry.findAll({

      // ✅ Cabecera factura
      attributes: [
        "id",
        "invoice_number",
        "supplier_id",
        "location_id",
        "date",
        "user",
        "is_active",
        "created_at"
      ],

      include: [

        // ✅ Location
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"]
        },

        // ✅ Supplier
        {
          model: Supplier,
          as: "supplier",
          attributes: ["id", "name"],
          required: false
        },

        // ✅ Detalles (productos dentro factura)
        {
          model: EntryDetail,
          as: "details",
          required: false, // 🔥 evita errores si no hay productos
          attributes: [
            "id",
            "product_id",
            "quantity",
            "unit_cost",
            "subtotal"
          ],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "code"],
              required: false
            }
          ]
        }
      ],

      order: [["created_at", "DESC"]]
    });

    // ====================================================
    // ✅ CALCULAR TOTAL POR FACTURA (PRO)
    // ====================================================
    const formatted = entries.map(entry => {

      const total = entry.details?.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
      ) || 0;

      return {
        ...entry.toJSON(),
        total
      };
    });

    return res.status(200).json({
      status: true,
      msg: "Facturas listadas correctamente ✅",
      entries: formatted
    });

  } catch (error) {
    console.error("❌ Error al listar facturas:", error);

    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message
    });
  }
};

/* ===========================================================
   🟢 CREAR ENTRADA
=========================================================== */

const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { location_id, supplier_id, invoice_number, items, date } = req.body;
    const loggedUser = req.user || { id: 1, email: "admin@prueba.com" };

    // ✅ Validación inicial
    if (!location_id || !invoice_number || !items?.length) {
      await t.rollback();
      return res.status(400).json({
        status: false,
        msg: "Faltan datos obligatorios",
      });
    }

    // ==================================================
    // 🔎 BUSCAR PROVEEDOR PARA DESCRIPCIÓN
    // ==================================================
    const supplier = supplier_id
      ? await Supplier.findByPk(supplier_id, { transaction: t })
      : null;

    // ==================================================
    // 1️⃣ CREAR FACTURA (ENTRY HEADER)
    // ==================================================
    const entryHeader = await Entry.create(
      {
        location_id,
        supplier_id,
        invoice_number,
       date: new Date(),
        user: loggedUser.email,
        is_active: true,
        user_creates_id: loggedUser.id,
        total: 0,
      },
      { transaction: t }
    );

    let totalCost = 0;

    // ==================================================
    // 2️⃣ CREAR OPERACIÓN PRINCIPAL (UNA SOLA)
    // ==================================================
    const operation = await Operation.create(
      {
        date: new Date(),


        // ✅ DESCRIPCIÓN PROFESIONAL
        description: `Entrada de mercancía – Factura #${invoice_number} – ${supplier?.name || "Proveedor no definido"}`,

        user: loggedUser.email,
        type: "ENTRY",
        total: 0,
        amount: 0,
        location_id,
        entry_id: entryHeader.id,
        is_active: true,
        user_creates_id: loggedUser.id,
      },
      { transaction: t }
    );

    // ==================================================
    // 3️⃣ LOOP ÚNICO → ENTRY_DETAIL + OPERATION_DETAIL + STOCK
    // ==================================================
    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || Number(quantity) <= 0) {
        await t.rollback();
        return res.status(400).json({
          status: false,
          msg: "Producto o cantidad inválida",
        });
      }

      // 🔎 Buscar producto
      const product = await Product.findByPk(product_id, {
        transaction: t,
      });

      if (!product) {
        await t.rollback();
        return res.status(404).json({
          status: false,
          msg: `Producto ID ${product_id} no encontrado`,
        });
      }

      // ✅ PRECIO UNITARIO
      const unitCost = item.unit_cost
        ? Number(item.unit_cost)
        : Number(product.purchasePrice || 0);

      if (unitCost <= 0) {
        await t.rollback();
        return res.status(400).json({
          status: false,
          msg: `El producto ${product.name} no tiene precio de compra`,
        });
      }

      // ✅ SUBTOTAL
      const subtotal = Number(quantity) * unitCost;
      totalCost += subtotal;

      // ✅ ENTRY DETAIL
      await EntryDetail.create(
        {
          entry_id: entryHeader.id,
          product_id,
          quantity: Number(quantity),
          unit_cost: unitCost,
          subtotal,
        },
        { transaction: t }
      );

      // ✅ OPERATION DETAIL
      await OperationDetail.create(
        {
          operation_id: operation.id,
          product_id,
          quantity: Number(quantity),
          purchasePrice: unitCost,
          salePrice: 0,
          type: "ENTRY",
          is_active: true,
        },
        { transaction: t }
      );

      // ✅ ACTUALIZAR STOCK GLOBAL
      product.quantity = (product.quantity || 0) + Number(quantity);
      await product.save({ transaction: t });

      // ✅ STOCK POR UBICACIÓN
      let lp = await LocationProduct.findOne({
        where: { location_id, product_id },
        transaction: t,
      });

      if (lp) {
        lp.stock += Number(quantity);
        await lp.save({ transaction: t });
      } else {
        await LocationProduct.create(
          {
            location_id,
            product_id,
            stock: Number(quantity),
          },
          { transaction: t }
        );
      }
    }

    // ==================================================
    // ✅ GUARDAR TOTAL FINAL
    // ==================================================
    totalCost = Number(totalCost.toFixed(2));

    entryHeader.total = totalCost;
    await entryHeader.save({ transaction: t });

    operation.total = totalCost;
    operation.amount = totalCost;
    await operation.save({ transaction: t });

    // ==================================================
    // 4️⃣ ASIENTO CONTABLE ÚNICO
    // ==================================================
    await createJournalsFromOperation(operation, t);

    // ==================================================
    // ✅ COMMIT FINAL
    // ==================================================
    await t.commit();

    return res.status(201).json({
      status: true,
      msg: "Entrada creada correctamente ✅ (Factura + Kardex + Contabilidad)",
      entry: entryHeader,
      operation,
      totalCost,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();

    console.error("❌ Error creando entrada:", error);

    return res.status(500).json({
      status: false,
      msg: error.message || "Error interno",
    });
  }
};

/* ===========================================================
   📌 OBTENER UNA ENTRADA
=========================================================== */
const show = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await Entry.findByPk(id, {
      include: [
        // ✅ Location
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"]
        },

        // ✅ Details + Products
        {
          model: EntryDetail,
          as: "details",
          attributes: ["id", "quantity", "unit_cost", "subtotal"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "product_code"]
            }
          ]
        }
      ]
    });

    if (!entry) {
      return res.status(404).json({
        status: false,
        msg: "Entrada no encontrada",
        entry: null
      });
    }

    // ===============================
    // ✅ TOTAL FACTURA
    // ===============================
    let total = 0;

    entry.details.forEach((d) => {
      total += Number(d.subtotal);
    });

    // ===============================
    // ✅ RESPUESTA PROFESIONAL
    // ===============================
    return res.status(200).json({
      status: true,
      msg: "Entrada encontrada ✅",
      entry: {
        ...entry.toJSON(),

        // Nombre ubicación directo
        locationName: entry.location?.name || "N/A",

        // Productos dentro factura
        products: entry.details.map((d) => ({
          productName: d.product?.name || "N/A",
          productCode: d.product?.product_code || "N/A",
          quantity: d.quantity,
          unit_cost: d.unit_cost,
          subtotal: d.subtotal
        })),

        // Total calculado
        total
      }
    });

  } catch (error) {
    console.error("❌ Error en show:", error);

    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message
    });
  }
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
        { model: Product, as: "product", attributes: ["id", "name", "product_code"] }
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
