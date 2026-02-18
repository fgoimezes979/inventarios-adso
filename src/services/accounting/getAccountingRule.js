import { ACCOUNTING_RULES } from "./journalRules.js";

export function getAccountingRule(type) {
  if (type === "INCOME") return ACCOUNTING_RULES.PURCHASE;
  if (type === "OUTCOME") return ACCOUNTING_RULES.SALE;

  throw new Error("Tipo de operación sin regla contable");
}
