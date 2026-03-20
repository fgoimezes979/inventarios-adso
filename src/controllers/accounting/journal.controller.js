// controllers/accounting/journal.controller.js

const { JournalEntry, sequelize } = require("../../models/model-index");

/* ===========================================================
   📋 LISTAR TODOS LOS ASIENTOS (MODELO VIEJO)
=========================================================== */
const index = async (req, res) => {
  try {

    const entries = await JournalEntry.findAll({
      where: { isActive: true },
      order: [
        ["date", "DESC"],
        ["created_at", "DESC"],
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
   📘 LIBRO DIARIO (MODELO NUEVO)
=========================================================== */
const report = async (req, res) => {
  try {

    const [rows] = await sequelize.query(`
      SELECT 
        j.id AS journal_id,
        j.date,
        j.description,
        a.code AS account_code,
        a.name AS account_name,
        jd.debit,
        jd.credit
      FROM journals j
      JOIN journal_details jd ON j.id = jd.journal_id
      JOIN accounts a ON jd.account_id = a.id
      ORDER BY j.date, j.id
    `);

    return res.status(200).json({
      status: true,
      rows
    });

  } catch (error) {
    console.error("❌ Error libro diario:", error);
    return res.status(500).json({
      status: false,
      msg: "Error obteniendo libro diario",
      error: error.message
    });
  }
};


/* ===========================================================
   📌 CREAR ASIENTO CONTABLE (MODELO VIEJO)
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

    if (!date || !description || !debitAccount || !creditAccount || !amount) {
      return res.status(400).json({ status: false, msg: "Faltan datos obligatorios" });
    }

    if (amount <= 0) {
      return res.status(400).json({ status: false, msg: "El monto debe ser mayor a cero" });
    }

    if (debitAccount === creditAccount) {
      return res.status(400).json({ status: false, msg: "Las cuentas no pueden ser iguales" });
    }

    const newEntry = await JournalEntry.create(
      {
        date,
        description,
        debitAccount,
        creditAccount,
        amount,
        user: user || "Sistema",
        isActive: true,
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
   📌 BALANCE DE PRUEBA
=========================================================== */

const trialBalance = async (req, res) => {
  try {

    const [rows] = await sequelize.query(`
      SELECT 
        a.code,
        a.name,
        a.type,
        SUM(jd.debit) AS total_debit,
        SUM(jd.credit) AS total_credit
      FROM journal_details jd
      JOIN accounts a ON jd.account_id = a.id
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `);

    return res.status(200).json({
      status: true,
      rows
    });

  } catch (error) {
    console.error("❌ Error balance de prueba:", error);
    return res.status(500).json({
      status: false,
      msg: "Error obteniendo balance de prueba"
    });
  }
};

 /* ===========================================================
   📌 LISTAR PLAN DE CUENTAS (para selector en frontend)
=========================================================== */

const getAccounts = async (req, res) => {
  try {

    const [rows] = await sequelize.query(`
      SELECT 
        id,
        code,
        name
      FROM accounts
      ORDER BY code ASC
    `);

    return res.status(200).json({
      status: true,
      accounts: rows
    });

  } catch (error) {

    console.error("❌ Error obteniendo cuentas:", error);

    return res.status(500).json({
      status: false,
      msg: "Error obteniendo cuentas contables",
      error: error.message
    });

  }
};


/* ===========================================================
   📌 LIBRO MAYOR
=========================================================== */

const getLedger = async (req, res) => {
  try {

    const { account_id } = req.params;
    const { from, to } = req.query;

    /** ------------------------------------
     * 1️⃣ SALDO INICIAL ANTES DEL PERIODO
    ------------------------------------- */

    const [openingRows] = await sequelize.query(`
      SELECT 
        SUM(jd.debit) AS debit,
        SUM(jd.credit) AS credit
      FROM journal_details jd
      JOIN journals j ON jd.journal_id = j.id
      WHERE jd.account_id = :account_id
      AND j.date < :from
    `,{
      replacements: { account_id, from }
    });

    let openingBalance =
      Number(openingRows[0].debit || 0) -
      Number(openingRows[0].credit || 0);
     


    /** ------------------------------------
     * 2️⃣ MOVIMIENTOS DEL PERIODO
    ------------------------------------- */

    const [rows] = await sequelize.query(`
      SELECT 
        j.date,
        j.description,
        a.code,
        a.name,
        jd.debit,
        jd.credit
      FROM journal_details jd
      JOIN journals j ON jd.journal_id = j.id
      JOIN accounts a ON jd.account_id = a.id
      WHERE jd.account_id = :account_id
      AND j.date BETWEEN :from AND :to
      ORDER BY j.date, jd.id
    `,{
      replacements: { account_id, from, to }
    });

    let balance = openingBalance;

    const ledger = rows.map(row => {

      balance += Number(row.debit) - Number(row.credit);

      return {
        date: row.date,
        description: row.description,
        account: `${row.code} - ${row.name}`,
        debit: Number(row.debit),
        credit: Number(row.credit),
        balance
      };

    });


    /** ------------------------------------
     * 3️⃣ TOTALES
    ------------------------------------- */

    const totalDebit = ledger.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = ledger.reduce((sum, r) => sum + r.credit, 0);


    return res.status(200).json({
      status: true,
      openingBalance,
      totalDebit,
      totalCredit,
      closingBalance: balance,
      ledger
    });

  } catch (error) {

    console.error("❌ Error libro mayor:", error);

    return res.status(500).json({
      status: false,
      msg: "Error obteniendo libro mayor",
      error: error.message
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
   ✏️ ACTUALIZAR ASIENTO
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
   🚫 ANULAR ASIENTO
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
// controllers/accounting/journal.controller.js

const getIncomeStatement = async (req, res) => {
  try {

    const [rows] = await sequelize.query(`
      SELECT 
        a.code,
        a.name,
        SUM(jd.debit) AS total_debit,
        SUM(jd.credit) AS total_credit
      FROM journal_details jd
      JOIN accounts a ON jd.account_id = a.id
      GROUP BY a.id, a.code, a.name
      ORDER BY a.code
    `);

    const ingresos = rows.filter(c => c.code.startsWith('4'));
    const costos   = rows.filter(c => c.code.startsWith('6'));
    const gastos   = rows.filter(c => c.code.startsWith('5'));

    const totalIngresos = ingresos.reduce((s, r) => s + Number(r.total_credit), 0);
    const totalCostos   = costos.reduce((s, r) => s + Number(r.total_debit), 0);
    const totalGastos   = gastos.reduce((s, r) => s + Number(r.total_debit), 0);

    const utilidad = totalIngresos - totalCostos - totalGastos;

    return res.status(200).json({
      ingresos,
      costos,
      gastos,
      totalIngresos,
      totalCostos,
      totalGastos,
      utilidad
    });

  } catch (error) {
    console.error("❌ Error estado de resultados:", error);
    return res.status(500).json({
      status: false,
      msg: "Error obteniendo estado de resultados",
      error: error.message
    });
  }
};

module.exports = {
 trialBalance,
 getIncomeStatement,  // 👈 AGREGA ESTO
  index,
  report,   // 👈 IMPORTANTE
  create,
  show,
  update,
  destroy,
  getLedger,
  getAccounts
};