const Operation = require("../../../models/parameters/operations/operation.model");

// =========================
// 🔹 LISTAR OPERACIONES
// =========================
const index = async (req, res) => {
  try {
    let operations = await Operation.findAll({
      order: [["created_at", "ASC"]],
    });

    operations = operations.map(op => {
      const qty = Number(op.quantity || 0);
      const price = Number(op.salePrice || op.purchasePrice || 0);
      const amount = +(qty * price).toFixed(2);

      return {
        ...op.toJSON(),
        income: op.type === "INCOME" ? amount : 0,
        outcome: op.type === "OUTCOME" ? amount : 0,
        total: amount,
      };
    });

    return res.status(200).json({
      status: true,
      operations,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Error interno al listar operaciones",
    });
  }
};

// =========================
// 🔹 CREAR OPERACIÓN
// =========================
const create = async (req, res) => {
  try {
    let { date, description, user, purchasePrice, salePrice, quantity, type } = req.body;

    if (!date || !quantity || !type) {
      return res.status(400).json({
        status: false,
        msg: "La fecha, cantidad y tipo son obligatorios",
      });
    }

    quantity = Number(quantity || 1);
    purchasePrice = Number(purchasePrice || 0);
    salePrice = Number(salePrice || 0);

    const price = type === "INCOME" ? purchasePrice : salePrice;
    const amount = +(quantity * price).toFixed(2);

    // Obtener último balance
    const lastOperation = await Operation.findOne({
      order: [["created_at", "DESC"]],
    });

    const previousBalance = lastOperation ? Number(lastOperation.balance) : 0;

    let newBalance = previousBalance;
    if (type === "INCOME") newBalance += amount;
    if (type === "OUTCOME") newBalance -= amount;

    const newOperation = await Operation.create({
      date,
      description,
      user: user || "sistema",
      purchasePrice,
      salePrice,
      quantity,
      type,
      balance: newBalance,
    });

    return res.status(201).json({
      status: true,
      msg: "Operación creada correctamente",
      operation: {
        ...newOperation.toJSON(),
        income: type === "INCOME" ? amount : 0,
        outcome: type === "OUTCOME" ? amount : 0,
        total: amount,
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};



// =========================
// 🔹 MOSTRAR
// =========================
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await Operation.findByPk(id);

    if (!operation) {
      return res.status(404).json({
        status: false,
        msg: "Operación no encontrada",
      });
    }

    const qty = Number(operation.quantity || 0);
    const price = Number(operation.purchasePrice || 0);
    const amount = +(qty * price).toFixed(2);

    return res.status(200).json({
      status: true,
      operation: {
        ...operation.toJSON(),
        income: operation.type === "INCOME" ? amount : 0,
        outcome: operation.type === "OUTCOME" ? amount : 0,
        total: amount,
      },
    });
  } catch (error) {
    console.error("❌ Error al mostrar operación:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al mostrar operación",
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
      return res.status(404).json({
        status: false,
        msg: "Operación no encontrada",
      });
    }

    await operation.update(req.body);

    const qty = Number(operation.quantity || 0);

    // 🔥 USAR salePrice cuando es OUTCOME
    const price =
      operation.type === "OUTCOME"
        ? Number(operation.salePrice || 0)
        : Number(operation.purchasePrice || 0);

    const amount = +(qty * price).toFixed(2);

    return res.status(200).json({
      status: true,
      msg: "Operación actualizada correctamente",
      operation: {
        ...operation.toJSON(),
        income: operation.type === "INCOME" ? amount : 0,
        outcome: operation.type === "OUTCOME" ? amount : 0,
        total: amount,
      },
    });
  } catch (error) {
    console.error("❌ Error al actualizar operación:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al actualizar operación",
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
      return res.status(404).json({
        status: false,
        msg: "Operación no encontrada",
      });
    }

    await operation.destroy();

    return res.status(200).json({
      status: true,
      msg: "Operación eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar operación:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno al eliminar operación",
    });
  }
};

module.exports = { index, create, show, update, destroy };
