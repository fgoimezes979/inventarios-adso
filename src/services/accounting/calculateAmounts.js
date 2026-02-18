export function calculateAmounts(operation) {
  const { type, quantity, purchasePrice, salePrice } = operation;

  if (type === "INCOME") {
    return [quantity * purchasePrice];
  }

  if (type === "OUTCOME") {
    return [
      quantity * salePrice,     // Ingreso
      quantity * purchasePrice, // Costo
    ];
  }

  throw new Error("No se puede calcular el monto");
}
