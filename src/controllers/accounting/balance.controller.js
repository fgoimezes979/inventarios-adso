const { sequelize } = require("../../models/model-index");

const getBalanceSheet = async (req, res) => {
  try {

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: false,
        msg: "Debe enviar startDate y endDate"
      });
    }

    // 1️⃣ Traer movimientos agrupados por cuenta
    const [rows] = await sequelize.query(`
      SELECT 
        a.code,
        a.name,
        a.type,
        LENGTH(a.code) as nivel,
        SUM(jd.debit) as total_debit,
        SUM(jd.credit) as total_credit
      FROM journal_details jd
      JOIN journals j ON jd.journal_id = j.id
      JOIN accounts a ON jd.account_id = a.id
      WHERE j.date BETWEEN :startDate AND :endDate
      GROUP BY a.code, a.name, a.type
      ORDER BY a.code
    `, {
      replacements: { startDate, endDate }
    });

    let totalActivos = 0;
    let totalPasivos = 0;
    let totalPatrimonio = 0;

    let totalIngresos = 0;
    let totalCostosGastos = 0;

    const activos = [];
    const pasivos = [];
    const patrimonio = [];

    // 2️⃣ Procesar cuentas
    rows.forEach(acc => {

      const debit = Number(acc.total_debit || 0);
      const credit = Number(acc.total_credit || 0);

      let saldo = 0;

      // 🟢 Activos
      if (acc.type === "ASSET") {
        saldo = debit - credit;
        totalActivos += saldo;
        activos.push({ ...acc, saldo });
      }

      // 🔴 Pasivos
      if (acc.type === "LIABILITY") {
        saldo = credit - debit;
        totalPasivos += saldo;
        pasivos.push({ ...acc, saldo });
      }

      // 🟣 Patrimonio
      if (acc.type === "EQUITY") {
        saldo = credit - debit;
        totalPatrimonio += saldo;
        patrimonio.push({ ...acc, saldo });
      }

      // 🔵 Ingresos
      if (acc.type === "INCOME") {
        totalIngresos += credit - debit;
      }

      // 🟡 Costos y Gastos
      if (acc.type === "EXPENSE") {
        totalCostosGastos += debit - credit;
      }

    });

    // 3️⃣ Calcular utilidad del período
    const utilidadPeriodo = totalIngresos - totalCostosGastos;

    // 4️⃣ Sumar utilidad al patrimonio
    totalPatrimonio += utilidadPeriodo;

    // 5️⃣ Validar equilibrio
    const diferencia = totalActivos - (totalPasivos + totalPatrimonio);

    return res.status(200).json({
      activos,
      pasivos,
      patrimonio,
      utilidadPeriodo,
      totalActivos,
      totalPasivos,
      totalPatrimonio,
      diferencia
    });

  } catch (error) {
    console.error("❌ Error Balance General:", error);
    return res.status(500).json({
      status: false,
      msg: error.message
    });
  }
};

module.exports = { getBalanceSheet };