const {
  sequelize,
  Product,
  LocationProduct,
  Operation,
  OperationDetail,
  JournalEntry
} = require("../../../models/model-index");

// Servicio contable
const { createJournalsFromOperation } = require("../../../services/accounting/createJournals");
const { getAccountByCode } = require("../../../helpers/account.helper");
const index = async (req, res) => {
  try {

    let operations = await Operation.findAll({
      order: [["date", "ASC"]],
      include: [
        {
          model: OperationDetail,
          as: "details",
          required: false,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
              required: false
            }
          ]
        }
      ]
    });

    let runningBalance = 0;

    // =================================================
    // 🔥 BUSCAR SALDO INICIAL
    // =================================================
    const initialOp = operations.find(op =>
      (op.description || "").toLowerCase().includes("saldo inicial")
    );

    if (initialOp) {
      runningBalance = Number(initialOp.amount || 0);
    }

    // =================================================
    // 🔁 RECORRER OPERACIONES
    // =================================================
    const result = [];

    for (const op of operations) {

      const json = op.toJSON();

      // ⛔ Saltar saldo inicial
      if ((json.description || "").toLowerCase().includes("saldo inicial")) {
        continue;
      }

      const amount = Number(json.amount || 0);

      let total = 0;

      if (json.type === "ENTRY") total = amount;
      if (json.type === "SALE") total = -amount;

      runningBalance += total;

      result.push({
        ...json,

        // 🔥 ENVIAR PRODUCTNAME
        details: (json.details || []).map(d => ({
          ...d,
          productName: d.product?.name || "Sin nombre"
        })),

        debit: json.type === "ENTRY" ? amount : 0,
        credit: json.type === "SALE" ? amount : 0,
        total,
        balance: runningBalance
      });
    }

    return res.json({
      status: true,
      initialBalance: initialOp ? Number(initialOp.amount) : 0,
      operations: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error listando operaciones" });
  }
};


// =========================
// 🔹 CREAR OPERACIÓN
// =========================
const create = async (req, res) => {

  try {

    const {
  date,
  description,
  user,
  type,
  details,
  location_id,          // 👈 NUEVO
  from_location_id,
  to_location_id
} = req.body;

    // =====================
    // VALIDACIONES
    // =====================
    if (!type || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "Debe enviar type y details"
      });
    }

    if (type === "TRANSFER") {

      if (!from_location_id || !to_location_id) {
        return res.status(400).json({
          status: false,
          msg: "TRANSFER requiere from_location_id y to_location_id"
        });
      }

      if (from_location_id === to_location_id) {
        return res.status(400).json({
          status: false,
          msg: "No puede transferir a la misma ubicación"
        });
      }
    }

    // =====================
    // ABRIR TRANSACCIÓN
    // =====================
    const t = await sequelize.transaction();

    try {

      const newOperation = await Operation.create({
  date: date || new Date(),
  description: description || "Operación automática",
  user: user || "Sistema",
  type,
  location_id,     // 👈 ESTA ES LA LÍNEA CLAVE
  total: 0,
  amount: 0,
  is_active: true
}, { transaction: t });

// ==================================================
// 🔥 CASO ESPECIAL: SALDO INICIAL (SIN PRODUCTO)
// ==================================================
if (type === "ENTRY" && !details[0].product_id) {

  const amount = Number(details[0].purchasePrice || 0);

  if (amount <= 0) {
    throw new Error("Monto inválido para saldo inicial");
  }

  await newOperation.update({
    total: amount,
    amount: amount
  }, { transaction: t });

  // Crear asiento contable
  await createJournalsFromOperation(newOperation, t);

  await t.commit();

  return res.status(201).json({
    status: true,
    msg: "Saldo inicial registrado correctamente ✅",
    operation: newOperation
  });
}



      let totalAmount = 0;

      for (const item of details) {

        const product = await Product.findByPk(item.product_id, { transaction: t });

        if (!product) {
          throw new Error(`Producto ${item.product_id} no encontrado`);
        }

        const quantity = Number(item.quantity);

        if (quantity <= 0) {
          throw new Error("Cantidad inválida");
        }

        let unitPrice = 0;

        if (type === "ENTRY") unitPrice = Number(item.purchasePrice || product.purchasePrice);
        if (type === "SALE") unitPrice = Number(item.salePrice || product.salePrice);

        const subtotal = quantity * unitPrice;
        totalAmount += subtotal;

        await OperationDetail.create({
          operation_id: newOperation.id,
          product_id: product.id,
          quantity,
          purchasePrice: type === "ENTRY" ? unitPrice : 0,
          salePrice: type === "SALE" ? unitPrice : 0,
          type,
          is_active: true
        }, { transaction: t });

        // STOCK GENERAL
        if (type === "ENTRY") {
          product.quantity += quantity;
          await product.save({ transaction: t });
        }

        if (type === "SALE") {

          if (product.quantity < quantity) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          product.quantity -= quantity;
          await product.save({ transaction: t });
        }

        // TRANSFERENCIA
        if (type === "TRANSFER") {

          const fromStock = await LocationProduct.findOne({
            where: { location_id: from_location_id, product_id: product.id },
            transaction: t
          });

          if (!fromStock || fromStock.stock < quantity) {
            throw new Error(`Stock insuficiente en origen para ${product.name}`);
          }

          fromStock.stock -= quantity;
          await fromStock.save({ transaction: t });

          let toStock = await LocationProduct.findOne({
            where: { location_id: to_location_id, product_id: product.id },
            transaction: t
          });

          if (!toStock) {
            toStock = await LocationProduct.create({
              location_id: to_location_id,
              product_id: product.id,
              stock: 0
            }, { transaction: t });
          }

          toStock.stock += quantity;
          await toStock.save({ transaction: t });
        }

      }

      await newOperation.update({
        total: totalAmount,
        amount: totalAmount
      }, { transaction: t });

      if (type !== "TRANSFER") {
        await createJournalsFromOperation(newOperation, t);
      }

      await t.commit();

      return res.status(201).json({
        status: true,
        msg: "Operación creada correctamente ✅",
        operation: newOperation
      });

    } catch (error) {

      await t.rollback();
      throw error;

    }

  } catch (error) {

    return res.status(500).json({
      status: false,
      msg: error.message
    });

  }

};


// =========================
// 🔹 MOSTRAR
// =========================
const show = async (req, res) => {
  try {

    const { id } = req.params;

    const operation = await Operation.findByPk(id, {
      include: [{ model: OperationDetail, as: "details" }]
    });

    if (!operation) {
      return res.status(404).json({ status: false, msg: "Operación no encontrada" });
    }

    return res.status(200).json({ status: true, operation });

  } catch (error) {

    return res.status(500).json({
      status: false,
      msg: "Error interno al mostrar operación"
    });

  }
};


// =========================
// 🔹 ACTUALIZAR
// =========================
const update = async (req, res) => {
  try {

    const { id } = req.params;

    const operation = await Operation.findByPk(id);

    if (!operation) {
      return res.status(404).json({ status: false, msg: "Operación no encontrada" });
    }

    await operation.update(req.body);

    return res.status(200).json({
      status: true,
      msg: "Operación actualizada correctamente",
      operation
    });

  } catch (error) {

    return res.status(500).json({
      status: false,
      msg: "Error interno al actualizar operación"
    });

  }
};


// =========================
// 🔹 ELIMINAR
// =========================
const destroy = async (req, res) => {
  try {

    const { id } = req.params;

    const operation = await Operation.findByPk(id);

    if (!operation) {
      return res.status(404).json({ status: false, msg: "Operación no encontrada" });
    }

    await operation.destroy();

    return res.status(200).json({
      status: true,
      msg: "Operación eliminada correctamente"
    });

  } catch (error) {

    return res.status(500).json({
      status: false,
      msg: "Error interno al eliminar operación"
    });

  }
};


// =========================
// EXPORTS
// =========================
module.exports = {
  index,
  create,
  show,
  update,
  destroy
};
