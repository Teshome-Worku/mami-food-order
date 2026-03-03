import { CURRENCY } from "../constants";

export const formatCurrency = (amount, currency = CURRENCY) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return `0 ${currency}`;
  }

  return `${value.toLocaleString()} ${currency}`;
};

export const formatDateTime = (isoDate) => {
  if (!isoDate) return "-";

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
};
