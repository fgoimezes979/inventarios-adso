const { JournalEntry } = require("../../models/model-index");

console.log("📦 createJournals.js CARGADO");

const createJournalsFromOperation = async (operation, transaction) => {
  console.log("🔥 ENTRE AL SERVICIO DE ASIENTOS");

  if (!operation || !operation.id) {
    throw new Error("Operación inválida para crear asiento");
  }

  let debitAccount = "";
  let creditAccount = "";

  // ✅ Tipo seguro
  const type = (operation.type || "").toUpperCase();

  // ==================================================
  // ✅ CUENTAS SEGÚN TIPO
  // ==================================================
  switch (type) {
    case "ENTRY":
    case "INCOME":
      debitAccount = "Inventarios";
      creditAccount = "Caja";
      break;

    case "SALE":
    case "OUTCOME":
    case "EXPENSE":
      debitAccount = "Caja";
      creditAccount = "Ingresos";
      break;

    case "COST":
      debitAccount = "Costo de Ventas";
      creditAccount = "Inventarios";
      break;

    default:
      throw new Error(`Tipo de operación no soportado: ${operation.type}`);
  }

  // ==================================================
  // ✅ MONTO REAL: TOTAL > AMOUNT > CALCULO
  // ==================================================
  let amount = Number(operation.total || operation.amount || 0);

  console.log("📌 Total recibido:", operation.total);
  console.log("📌 Amount recibido:", operation.amount);
  console.log("📌 Amount calculado:", amount);

  // ==================================================
  // ✅ Si aún no hay monto → calcular por qty * price
  // ==================================================
  if (amount <= 0) {
    const qty = Number(operation.quantity || 0);
    let price = 0;

    if (["ENTRY", "INCOME", "COST"].includes(type)) {
      price = Number(operation.purchasePrice || 0);
    }

    if (["SALE", "OUTCOME", "EXPENSE"].includes(type)) {
      price = Number(operation.salePrice || 0);
    }

    amount = Number((qty * price).toFixed(2));
  }

  // ==================================================
  // ❌ VALIDACIÓN FINAL
  // ==================================================
  if (amount <= 0) {
    throw new Error(`Monto contable inválido (amount=${amount})`);
  }

  // ==================================================
  // ✅ DESCRIPCIÓN CLARA
  // ==================================================
  const description =
  type === "COST"
    ? `Costo de venta – ${operation.description}`
    : operation.description;


  // ==================================================
  // ✅ CREAR ASIENTO CONTABLE
  // ==================================================
  const asiento = await JournalEntry.create(
    {
      date: operation.date || new Date(),
      description,
      debitAccount,
      creditAccount,
      amount,
      user: operation.user || "Sistema",
      isActive: true,
      operation_id: operation.id,
    },
    { transaction }
  );

  console.log("🧾 ASIENTO CREADO:", asiento.toJSON());

  return asiento;
};

module.exports = { createJournalsFromOperation };
