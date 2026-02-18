export const ACCOUNTING_RULES = {
  PURCHASE: {
    type: "INCOME",
    journals: [
      {
        debit: "Inventarios",
        credit: "Caja",
        description: "Compra de inventario",
      },
    ],
  },

  SALE: {
    type: "OUTCOME",
    journals: [
      {
        debit: "Caja",
        credit: "Ingresos",
        description: "Venta de producto",
      },
      {
        debit: "Costo de Ventas",
        credit: "Inventarios",
        description: "Costo de venta",
      },
    ],
  },
};
