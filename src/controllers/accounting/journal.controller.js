// controllers/accounting/journal.controller.js
const { JournalEntry } = require("../../models/model-index"); // Modelo

/* ===========================================================
   📋 LISTAR TODOS LOS ASIENTOS ACTIVOS
=========================================================== */
const index = async (req, res) => {
  try {
    
    const entries = await JournalEntry.findAll({
  where: { isActive: true },
  order: [
    ["date", "DESC"],
    ["created_at", "DESC"], // 👈 desempate
  ],
});

    return res.status(200).json({
      status: true,
      entries,
    });
  } catch (error) {
    console.error("❌ Error al listar asientos:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
    });
  }
};


/* ===========================================================
   📌 CREAR ASIENTO CONTABLE (PARTIDA DOBLE)
=========================================================== */
const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      date,
      description,
      debitAccount,
      creditAccount,
      amount,
      user
    } = req.body;

    // 🔒 Validaciones contables
    if (!date || !description || !debitAccount || !creditAccount || !amount) {
      return res.status(400).json({ status: false, msg: "Faltan datos obligatorios" });
    }

    if (amount <= 0) {
      return res.status(400).json({ status: false, msg: "El monto debe ser mayor a cero" });
    }

    if (debitAccount === creditAccount) {
      return res.status(400).json({ status: false, msg: "Las cuentas no pueden ser iguales" });
    }

    // 🔍 Logs para depuración
    console.log('Payload recibido (req.body):', req.body);
    console.log('Payload Sequelize:', {
      date,
      description,
      debitAccount,
      creditAccount,
      amount,
      user: user || "Sistema"
    });

    // ✅ Crear asiento con nombres correctos de Sequelize (camelCase)
    const newEntry = await JournalEntry.create(
      {
        date,
        description,
        debitAccount,
        creditAccount,
        amount,
        user: user || "Sistema",
        isActive: true, // camelCase según tu modelo
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      status: true,
      msg: "Asiento contable creado",
      entry: newEntry,
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error creando asiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
    });
  }
};


/* ===========================================================
   📌 OBTENER ASIENTO POR ID
=========================================================== */
const show = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await JournalEntry.findOne({
      where: { id, isActive: true }
    });

    if (!entry) {
      return res.status(404).json({ status: false, msg: "Asiento no encontrado" });
    }

    return res.status(200).json({ status: true, entry });
  } catch (error) {
    console.error("❌ Error mostrando asiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
    });
  }
};

/* ===========================================================
   ✏️ ACTUALIZAR ASIENTO (USO CONTROLADO)
=========================================================== */
const update = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await JournalEntry.findOne({
      where: { id, isActive: true }
    });

    if (!entry) {
      return res.status(404).json({ status: false, msg: "Asiento no encontrado" });
    }

    await entry.update(req.body);

    return res.status(200).json({
      status: true,
      msg: "Asiento actualizado",
      entry,
    });
  } catch (error) {
    console.error("❌ Error actualizando asiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
    });
  }
};

/* ===========================================================
   🚫 ANULAR ASIENTO (NO SE ELIMINA)
=========================================================== */
const destroy = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await JournalEntry.findOne({
      where: { id, isActive: true },
    });

    if (!entry) {
      return res.status(404).json({
        status: false,
        msg: "Asiento no encontrado",
      });
    }

    await entry.update({ isActive: false });

    return res.status(200).json({
      status: true,
      msg: "Asiento contable anulado correctamente",
    });
  } catch (error) {
    console.error("❌ Error anulando asiento:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno",
      error: error.message,
    });
  }
};


module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};
