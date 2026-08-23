import api from "./api";

export async function getBalance() {
  const { data } = await api.get("/payouts/balance");
  return data;
}

export async function getPayoutHistory() {
  const { data } = await api.get("/payouts");
  return data;
}

export async function listBanks() {
  const { data } = await api.get("/payouts/banks");
  return data;
}

export async function getFeeInfo() {
  const { data } = await api.get("/payouts/fee-info");
  return data;
}

export async function requestPayout({ amount, bankName, bankCode, accountNumber, accountName }) {
  const { data } = await api.post("/payouts/request", {
    amount,
    bankName,
    bankCode,
    accountNumber,
    accountName,
  });
  return data;
}
