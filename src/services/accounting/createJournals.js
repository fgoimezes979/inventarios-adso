const {
  Journal,
  JournalDetail,
  Account,
  OperationDetail,
  Product
} = require("../../models/model-index");

const createJournalsFromOperation = async (operation, transaction) => {

  if (!operation || !operation.id) {
    throw new Error("Operación inválida para crear asiento");
  }

  const type = (operation.type || "").toUpperCase();

  // 🔹 Columnas reales de operations
  const base = Number(operation.base_amount || 0);
  const tax = Number(operation.tax_amount || 0);
  const total = Number(operation.total || 0);

  if (total <= 0) {
    throw new Error("Monto inválido para asiento");
  }

  // 🔹 Crear cabecera del journal
  const journal = await Journal.create(
    {
      date: operation.date,
      description: operation.description,
      reference_type: type,
      reference_id: operation.id,
      user_id: operation.user,
      is_active: true
    },
    { transaction }
  );

  let lines = [];

  // ====================================================
  // ENTRY (Compra)
  // ====================================================
  if (type === "ENTRY") {

    const inventory = await Account.findOne({
      where: { name: "Inventarios Mercancías" },
      transaction
    });

    const ivaDescontable = await Account.findOne({
      where: { name: "IVA Descontable" },
      transaction
    });

    const supplier = await Account.findOne({
      where: { name: "Proveedores Nacionales" },
      transaction
    });

    if (!inventory || !supplier) {
      throw new Error("Cuentas contables no configuradas correctamente");
    }

    // Inventario (Debe)
    lines.push({
      journal_id: journal.id,
      account_id: inventory.id,
      debit: base,
      credit: 0
    });

    // IVA descontable (Debe)
    if (tax > 0 && ivaDescontable) {
      lines.push({
        journal_id: journal.id,
        account_id: ivaDescontable.id,
        debit: tax,
        credit: 0
      });
    }

    // Proveedor (Haber)
    lines.push({
      journal_id: journal.id,
      account_id: supplier.id,
      debit: 0,
      credit: total
    });
  }

  // ====================================================
  // SALE (Venta)
  // ====================================================
  // ====================================================
// SALE (Venta con 2 journals)
// ====================================================
if (type === "SALE") {

  const {
    OperationDetail,
    Product
  } = require("../../models/model-index");

  const cash = await Account.findOne({
    where: { name: "Caja General" },
    transaction
  });

  const sales = await Account.findOne({
    where: { name: "Ventas Nacionales" },
    transaction
  });

  const ivaPorPagar = await Account.findOne({
    where: { name: "IVA por Pagar" },
    transaction
  });

  const costAccount = await Account.findOne({
    where: { name: "Costo de Ventas" },
    transaction
  });

  const inventory = await Account.findOne({
    where: { name: "Inventarios Mercancías" },
    transaction
  });

  if (!cash || !sales || !inventory || !costAccount) {
    throw new Error("Cuentas contables no configuradas correctamente");
  }

  // =================================================
  // 🔹 JOURNAL 1 — INGRESO
  // =================================================
  const incomeJournal = await Journal.create(
    {
      date: operation.date,
      description: operation.description + " (Ingreso)",
      reference_type: type,
      reference_id: operation.id,
      user_id: operation.user,
      is_active: true
    },
    { transaction }
  );

  let incomeLines = [];

  incomeLines.push(
    {
      journal_id: incomeJournal.id,
      account_id: cash.id,
      debit: total,
      credit: 0
    },
    {
      journal_id: incomeJournal.id,
      account_id: sales.id,
      debit: 0,
      credit: base
    }
  );

  if (tax > 0 && ivaPorPagar) {
    incomeLines.push({
      journal_id: incomeJournal.id,
      account_id: ivaPorPagar.id,
      debit: 0,
      credit: tax
    });
  }

  await JournalDetail.bulkCreate(incomeLines, { transaction });

  // =================================================
  // 🔹 JOURNAL 2 — COSTO
  // =================================================
  const costJournal = await Journal.create(
    {
      date: operation.date,
      description: operation.description + " (Costo de Venta)",
      reference_type: type,
      reference_id: operation.id,
      user_id: operation.user,
      is_active: true
    },
    { transaction }
  );

  const details = await OperationDetail.findAll({
    where: { operation_id: operation.id },
    include: [{ model: Product, as: "product" }],
    transaction
  });

  let totalCost = 0;

 for (const d of details) {
  totalCost += Number(d.purchasePrice) * Number(d.quantity);
}

  totalCost = Number(totalCost.toFixed(2));
  console.log("TOTAL COSTO CALCULADO:", totalCost);

  if (totalCost > 0) {

    let costLines = [
      {
        journal_id: costJournal.id,
        account_id: costAccount.id,
        debit: totalCost,
        credit: 0
      },
      {
        journal_id: costJournal.id,
        account_id: inventory.id,
        debit: 0,
        credit: totalCost
      }
    ];

    await JournalDetail.bulkCreate(costLines, { transaction });
  }

  return; // 🔥 Importante para que no siga ejecutando abajo
}
  // ====================================================
  // VALIDACIÓN CONTABLE
  // ====================================================
  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit), 0);

  if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
    throw new Error(
      `El asiento no cuadra. Debe: ${totalDebit} Haber: ${totalCredit}`
    );
  }

  await JournalDetail.bulkCreate(lines, { transaction });

  return journal;
};

module.exports = { createJournalsFromOperation };